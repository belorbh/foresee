#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Configurador da câmera · Foresee (contador de pessoas)

Liga o "alarme por e-mail" de uma câmera iCSee / XMEye (sistema Xiongmai):
toda vez que a câmera detecta uma pessoa, ela manda um e-mail com o assunto
"ForeseeEntrada" para o Gmail da câmera. Um robô do Google lê esses e-mails
e manda só o horário para o Foresee.

Como usar (no Mac, ligado no MESMO Wi-Fi da câmera):
  python3 configurar-camera.py            (procura a câmera sozinho)
  python3 configurar-camera.py 192.168.0.50   (se já souber o IP)

O que ele faz:
  1. Acha a câmera no Wi-Fi e entra nela com o usuário e a senha que VOCÊ digitar.
  2. Salva uma cópia de segurança das configurações na sua Mesa (sem senhas).
  3. Mostra o que vai mudar e só muda depois que você confirmar.
  4. Pede para a câmera mandar um e-mail de teste.

Senhas: você digita, nada aparece na tela e nada é salvo em arquivo.
Não precisa instalar nada além do Python 3 (só usa a biblioteca padrão).
Protocolo baseado na documentação da Xiongmai e no projeto OpenIPC/python-dvr (licença MIT).
"""
import getpass
import hashlib
import json
import os
import socket
import struct
import sys
import time

ASSUNTO = "ForeseeEntrada"
PORTA = 34567
OK = (100, 150, 515, 603)
ERROS = {
    101: "erro desconhecido", 103: "pedido não permitido", 105: "não está logado",
    106: "usuário ou senha errados", 107: "esse usuário não tem permissão",
    203: "senha errada", 205: "IP bloqueado por muitas tentativas (espere uns minutos)",
    502: "comando inválido", 605: "recurso não suportado nessa câmera",
    607: "essa configuração não existe nessa câmera",
}


def falar(txt=""):
    print(txt, flush=True)


def perguntar(txt, padrao=None):
    r = input(f"{txt}{f' [{padrao}]' if padrao else ''}: ").strip()
    return r or (padrao or "")


def confirmar(txt):
    return perguntar(txt + " (s/n)").lower().startswith("s")


def sofia_hash(senha):
    """Hash de senha usado pelas câmeras Xiongmai (MD5 + tabela de 62 caracteres)."""
    md5 = hashlib.md5(senha.encode("utf-8")).digest()
    chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"
    return "".join(chars[(a + b) % 62] for a, b in zip(md5[::2], md5[1::2]))


def ip_do_hex(h):
    try:
        return socket.inet_ntoa(struct.pack("<I", int(str(h), 16)))
    except Exception:
        return str(h)


def procurar_cameras(segundos=4):
    """Pergunta no Wi-Fi quem é câmera Xiongmai (UDP 34569, comando 1530)."""
    achadas = {}
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        s.setsockopt(socket.SOL_SOCKET, socket.SO_BROADCAST, 1)
        s.bind(("", 34569))
        s.settimeout(0.5)
        pedido = struct.pack("BBHIIHHI", 255, 0, 0, 0, 0, 0, 1530, 0)
        fim = time.time() + segundos
        ultimo_envio = 0
        while time.time() < fim:
            if time.time() - ultimo_envio > 1:
                s.sendto(pedido, ("255.255.255.255", 34569))
                ultimo_envio = time.time()
            try:
                dados, origem = s.recvfrom(4096)
            except socket.timeout:
                continue
            if len(dados) < 20:
                continue
            msg, tam = struct.unpack("<HI", dados[14:20])
            if msg != 1531 or tam <= 0:
                continue
            try:
                info = json.loads(dados[20:20 + tam].replace(b"\x00", b"").decode("utf-8", "ignore"))
                nc = info.get("NetWork.NetCommon", {})
            except Exception:
                continue
            ip = ip_do_hex(nc.get("HostIP")) if nc.get("HostIP") else origem[0]
            achadas[ip] = {"ip": ip, "nome": nc.get("HostName", ""), "serial": nc.get("SN", ""), "porta": int(nc.get("TCPPort") or PORTA)}
    except OSError as e:
        falar(f"  (não consegui procurar sozinho: {e})")
    finally:
        s.close()
    return list(achadas.values())


class Camera:
    def __init__(self, ip, porta=PORTA):
        self.ip, self.porta = ip, porta
        self.sock = None
        self.sessao = 0
        self.seq = 0

    def conectar(self):
        self.sock = socket.create_connection((self.ip, self.porta), timeout=10)

    def fechar(self):
        try:
            if self.sock:
                self.sock.close()
        finally:
            self.sock = None

    def _receber(self, n):
        buf = b""
        while len(buf) < n:
            parte = self.sock.recv(n - len(buf))
            if not parte:
                raise ConnectionError("a câmera fechou a conexão")
            buf += parte
        return buf

    def enviar(self, msg_id, dados):
        corpo = json.dumps(dados, ensure_ascii=False).encode("utf-8")
        pacote = struct.pack("<BB2xII2xHI", 255, 0, self.sessao, self.seq, msg_id, len(corpo) + 2) + corpo + b"\x0a\x00"
        self.seq += 1
        self.sock.sendall(pacote)
        # A câmera pode mandar outros pacotes no meio (avisos): lê até achar a resposta deste comando.
        for _ in range(20):
            cab = self._receber(20)
            _, _, sessao, _, resp_id, tam = struct.unpack("<BB2xII2xHI", cab)
            corpo = self._receber(tam) if tam else b""
            if resp_id != msg_id + 1:
                continue
            texto = corpo.rstrip(b"\x00").rstrip(b"\n").rstrip(b"\x00").decode("utf-8", "ignore")
            try:
                return json.loads(texto) if texto else {}
            except json.JSONDecodeError:
                i, j = texto.find("{"), texto.rfind("}")
                return json.loads(texto[i:j + 1]) if i >= 0 and j > i else {}
        raise ConnectionError("a câmera não respondeu o comando")

    def entrar(self, usuario, senha):
        r = self.enviar(1000, {"EncryptType": "MD5", "LoginType": "DVRIP-Web", "PassWord": sofia_hash(senha), "UserName": usuario})
        ret = r.get("Ret")
        if ret not in OK:
            raise PermissionError(ERROS.get(ret, f"código {ret}"))
        self.sessao = int(str(r.get("SessionID", "0")), 16)
        return r

    def _sid(self):
        return "0x%08X" % self.sessao

    def ler(self, nome, codigo=1042):
        r = self.enviar(codigo, {"Name": nome, "SessionID": self._sid()})
        if r.get("Ret") in OK and nome in r:
            return r[nome]
        return None

    def gravar(self, nome, valor):
        r = self.enviar(1040, {"Name": nome, "SessionID": self._sid(), nome: valor})
        return r.get("Ret")

    def comando(self, nome, codigo, valor):
        r = self.enviar(codigo, {"Name": nome, "SessionID": self._sid(), nome: valor})
        return r.get("Ret")


def sem_senhas(obj):
    """Cópia do objeto com as senhas trocadas por ***."""
    if isinstance(obj, dict):
        return {k: ("***" if "password" in k.lower() and v else sem_senhas(v)) for k, v in obj.items()}
    if isinstance(obj, list):
        return [sem_senhas(x) for x in obj]
    return obj


def achar_chave(obj, termos):
    """Procura (em qualquer nível) uma chave que contenha um dos termos. Devolve (chave, valor) ou None."""
    if isinstance(obj, dict):
        for k, v in obj.items():
            if any(t in k.lower() for t in termos):
                return k, v
            r = achar_chave(v, termos)
            if r:
                return r
    elif isinstance(obj, list):
        for x in obj:
            r = achar_chave(x, termos)
            if r:
                return r
    return None


def canal0(v):
    return v[0] if isinstance(v, list) and v else (v if isinstance(v, dict) else None)


def entrar_na_camera(ip, porta, usuario, senha):
    cam = Camera(ip, porta)
    cam.conectar()
    cam.entrar(usuario, senha)
    return cam


def main():
    falar("=" * 60)
    falar(" Foresee · Configurador da câmera (contador de pessoas)")
    falar("=" * 60)
    falar("Deixe o Mac no MESMO Wi-Fi da câmera. Nada muda sem você confirmar.\n")

    # 1) Achar a câmera
    if len(sys.argv) > 1:
        ip, porta = sys.argv[1], int(sys.argv[2]) if len(sys.argv) > 2 else PORTA
    else:
        falar("1) Procurando câmeras no Wi-Fi…")
        cams = procurar_cameras()
        if not cams:
            falar("   Não achei sozinho. No iCSee, veja o IP em Configurações > Informações do dispositivo.")
            ip, porta = perguntar("   Digite o IP da câmera (ex.: 192.168.0.105)"), PORTA
        elif len(cams) == 1:
            ip, porta = cams[0]["ip"], cams[0]["porta"]
            falar(f"   Achei a câmera {cams[0]['nome'] or ''} no IP {ip}.")
        else:
            for i, c in enumerate(cams, 1):
                falar(f"   {i}) {c['ip']}  {c['nome']}  {c['serial']}")
            n = int(perguntar("   Qual delas é a da porta? Digite o número", "1"))
            ip, porta = cams[n - 1]["ip"], cams[n - 1]["porta"]

    # 2) Entrar
    falar("\n2) Usuário e senha da câmera")
    falar("   (é a senha do APARELHO, do iCSee: Configurações > Senha do dispositivo.")
    falar("    Se nunca mudou, o usuário é admin e a senha fica em branco.)")
    usuario = perguntar("   Usuário", "admin")
    senha_cam = getpass.getpass("   Senha da câmera (não aparece enquanto digita; Enter se for em branco): ")
    try:
        cam = entrar_na_camera(ip, porta, usuario, senha_cam)
    except PermissionError as e:
        falar(f"\n   ✗ A câmera recusou o login: {e}.")
        return 1
    except OSError as e:
        falar(f"\n   ✗ Não consegui falar com a câmera em {ip}:{porta} ({e}).")
        falar("   Confira se o Mac está no mesmo Wi-Fi. Se continuar, esse modelo pode não aceitar")
        falar("   configuração fora do app: me avise que eu sigo pelo plano B.")
        return 1
    falar("   ✓ Entrei na câmera.")
    if senha_cam == "":
        falar("   ⚠ ATENÇÃO: a câmera está SEM SENHA. Qualquer pessoa no Wi-Fi entra nela.")
        falar("     Depois, coloque uma senha no iCSee (Configurações > Senha do dispositivo).")

    # 3) Ler tudo e salvar cópia de segurança
    info = cam.ler("SystemInfo", 1020) or {}
    funcoes = cam.ler("SystemFunction", 1360) or {}
    email = cam.ler("NetWork.NetEmail")
    detect = cam.ler("Detect")
    if detect is None:
        detect = {"MotionDetect": cam.ler("Detect.MotionDetect"), "HumanDetection": cam.ler("Detect.HumanDetection")}
    cam.fechar()

    modelo = info.get("HardWare") or info.get("DeviceModel") or "?"
    versao = info.get("SoftWareVersion") or "?"
    falar(f"   Modelo: {modelo} · versão {versao}")
    mesa = os.path.join(os.path.expanduser("~"), "Desktop")
    pasta = mesa if os.path.isdir(mesa) else os.path.expanduser("~")
    backup = os.path.join(pasta, f"backup-camera-{time.strftime('%Y%m%d-%H%M%S')}.json")
    with open(backup, "w", encoding="utf-8") as f:
        json.dump(sem_senhas({"ip": ip, "SystemInfo": info, "NetWork.NetEmail": email, "Detect": detect}), f, ensure_ascii=False, indent=2)
    falar(f"   ✓ Cópia de segurança salva em: {backup}")

    # 4) Conferir recursos
    falar("\n3) Conferindo o que essa câmera sabe fazer")
    tem_email = isinstance(email, dict)
    md = canal0(detect.get("MotionDetect")) if isinstance(detect, dict) else None
    hd = canal0(detect.get("HumanDetection")) if isinstance(detect, dict) else None
    tem_alarme_email = bool(md and isinstance(md.get("EventHandler"), dict) and "MailEnable" in md["EventHandler"])
    cap_humano = achar_chave(funcoes, ["humandection", "humandetection", "humanped"])
    tem_humano = isinstance(hd, dict) or bool(cap_humano and cap_humano[1])
    falar(f"   {'✓' if tem_email else '✗'} E-mail (servidor de e-mail)")
    falar(f"   {'✓' if tem_alarme_email else '✗'} Mandar e-mail quando o alarme dispara")
    falar(f"   {'✓' if tem_humano else '✗'} Detecção de pessoa (humanoide)")
    if not (tem_email and tem_alarme_email):
        falar("\n   ✗ Essa câmera não tem alarme por e-mail. Me mande uma foto desta tela:")
        falar("     a gente segue pelo plano B (celular na porta). Nada foi alterado.")
        return 2
    if not tem_humano:
        falar("   ⚠ Não achei a detecção de pessoa: o alarme pode disparar com qualquer movimento.")
        if not confirmar("   Continuar mesmo assim?"):
            return 2

    # 5) Dados do Gmail
    falar("\n4) Gmail da câmera (crie um só para isso, ex.: contador.sualoja@gmail.com)")
    gmail = perguntar("   Endereço do Gmail").lower()
    while "@" not in gmail:
        gmail = perguntar("   Digite o e-mail completo (com @gmail.com)").lower()
    falar("   Senha de app: Conta Google > Segurança > Verificação em duas etapas > Senhas de app.")
    senha_app = getpass.getpass("   Senha de app (16 letras; não aparece enquanto digita): ").replace(" ", "")
    while len(senha_app) < 16:
        senha_app = getpass.getpass("   A senha de app tem 16 letras. Digite de novo: ").replace(" ", "")

    # 6) Montar as mudanças (só mexe no que existe)
    novo_email = json.loads(json.dumps(email))
    novo_email["Enable"] = True
    if "UseSSL" in novo_email:
        novo_email["UseSSL"] = True
    novo_email["Title"] = ASSUNTO
    novo_email["SendAddr"] = gmail
    recs = novo_email.get("Recievers")
    if isinstance(recs, list) and recs:
        novo_email["Recievers"] = [gmail] + ["none" if not r or r == gmail else r for r in recs[1:]]
    else:
        novo_email["Recievers"] = [gmail]
    srv = novo_email.get("MailServer")
    if isinstance(srv, dict):
        srv.update({"Address": "smtp.gmail.com", "Name": gmail, "Password": senha_app, "Anonymity": False})
        if "Port" in srv or "Port" not in novo_email:
            srv["Port"] = 465
    else:
        novo_email["MailServer"] = {"Address": "smtp.gmail.com", "Name": gmail, "Password": senha_app, "Anonymity": False, "Port": 465}
    if "Port" in novo_email:
        novo_email["Port"] = 465

    mudanca_detect = {"MotionDetect": [{"Enable": True, "EventHandler": {"MailEnable": True}}]}
    if isinstance(hd, dict):
        mudanca_detect["HumanDetection"] = [{"Enable": True}]

    falar("\n5) Vou fazer estas mudanças na câmera:")
    falar(f"   • Servidor de e-mail: smtp.gmail.com, porta 465, SSL, conta {gmail}")
    falar(f"   • Assunto dos e-mails de alarme: {ASSUNTO}  (destinatário: {gmail})")
    falar("   • Alarme de movimento ligado, mandando e-mail a cada disparo")
    if isinstance(hd, dict):
        falar("   • Detecção de pessoa ligada (só dispara com gente)")
    falar("   Não mexo em gravação, nuvem, Wi-Fi nem senha da câmera.")
    if not confirmar("\n   Pode aplicar?"):
        falar("   Ok, nada foi alterado.")
        return 0

    # 7) Aplicar (nova conexão: a câmera derruba sessão parada)
    try:
        cam = entrar_na_camera(ip, porta, usuario, senha_cam)
        r1 = cam.gravar("NetWork.NetEmail", novo_email)
        r2 = cam.gravar("Detect", mudanca_detect)
        if r2 not in OK:
            # firmware que não aceita o "Detect" inteiro: grava o canal 0 de cada parte
            md_novo = json.loads(json.dumps(md))
            md_novo["Enable"] = True
            md_novo["EventHandler"]["MailEnable"] = True
            r2 = cam.gravar("Detect.MotionDetect.[0]", md_novo)
            if isinstance(hd, dict):
                hd_novo = dict(hd, Enable=True)
                cam.gravar("Detect.HumanDetection.[0]", hd_novo)
        conf_email = cam.ler("NetWork.NetEmail") or {}
        conf_detect = cam.ler("Detect") or {}
    except (OSError, PermissionError) as e:
        falar(f"   ✗ Deu erro ao aplicar: {e}. Nada mais foi feito; a cópia de segurança está na Mesa.")
        return 1
    ok_email = r1 in OK and conf_email.get("Title") == ASSUNTO and conf_email.get("Enable") is True
    md_lido = canal0(conf_detect.get("MotionDetect")) if isinstance(conf_detect, dict) else None
    ok_alarme = r2 in OK and bool(md_lido and md_lido.get("EventHandler", {}).get("MailEnable") is True) if md_lido else r2 in OK
    falar(f"   {'✓' if ok_email else '✗'} E-mail configurado{'' if ok_email else f' (resposta {r1}: {ERROS.get(r1, r1)})'}")
    falar(f"   {'✓' if ok_alarme else '✗'} Alarme mandando e-mail{'' if ok_alarme else f' (resposta {r2}: {ERROS.get(r2, r2)})'}")

    # 8) Teste de e-mail
    falar("\n6) Pedindo para a câmera mandar um e-mail de teste…")
    teste = json.loads(json.dumps(novo_email))
    rt = cam.comando("OPMailTest", 1636, teste)
    if rt not in OK:
        # formato antigo da documentação: servidor como texto
        teste2 = dict(teste, MailServer="smtp.gmail.com")
        rt = cam.comando("OPMailTest", 1636, teste2)
    cam.fechar()
    if rt in OK:
        falar("   ✓ A câmera conseguiu mandar o e-mail de teste. Confira a caixa de entrada do Gmail.")
    else:
        falar(f"   ⚠ O teste respondeu {rt} ({ERROS.get(rt, 'sem descrição')}).")
        falar("     Faça o teste de verdade: passe na frente da câmera e veja se chega e-mail")
        falar(f"     com o assunto {ASSUNTO} no Gmail em até 2 minutos.")

    falar("\nPronto! Agora:")
    falar("  1. Passe na porta e confira se chega e-mail com o assunto " + ASSUNTO + ".")
    falar("  2. No Foresee: Mais > Loja e equipe > Contador de pessoas > Ligar o contador,")
    falar("     e siga o passo a passo do robô no Gmail da câmera.")
    falar("  Pode desligar o Mac: a câmera manda os e-mails sozinha.")
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        falar("\nCancelado. Nada mais foi alterado.")
        sys.exit(130)
