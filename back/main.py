import sys
import win32print
import json

# Nome da impressora pode ser passada como argumento
printer_name = sys.argv[1]  # Nome da impressora passado como argumento

# Função auxiliar para formatar linhas do recibo
def format_item(name, qty, price):
    qty = float(qty)  # Convertendo a quantidade para float, para garantir números decimais se necessário
    price = float(price)  # Garantir que o preço seja um número decimal
    total = qty * price
    # Definindo larguras fixas para cada coluna: nome (20), quantidade (8), preço (10) e total (10)
    formatted_line = f"{name:<20.20}{qty:>8.2f}{price:>10.2f}{total:>10.2f}\n"
    return formatted_line


# Comandos ESC/POS para inicializar o recibo
command = b'\x1B\x40'  # Inicializa a impressora (ESC @)
command += b'\x1B\x21\x08'  # Texto em negrito
command += b'EMPORIO GABAS\n'
command += b'\x1B\x21\x00'  # Texto normal
command += b'Rua Valdomiro Machado, 500-Pq. Ribeirao Preto\n'
command += b'Tel: (16) 988477223\n'
command += b'CNPJ: 216336270001-50\n'
command += b'------------------------------------------------\n'

# Lendo itens do stdin (recebido via JSON do Node.js)
input_data = sys.stdin.read()
print("Dados recebidos:", input_data)  # Adiciona essa linha para depuração
items = json.loads(input_data)

# Adicionar os itens no recibo
for item in items:
    command += format_item(item['name'], item['qty'], item['price']).encode('utf-8')

# Linha final de total
total = sum(float(item['qty']) * float(item['price']) for item in items)  # Certifique-se de que ambos são float
command += b'------------------------------------------------\n'
command += f"{'TOTAL GERAL:':>35}{total:>10.2f}\n".encode('utf-8')
command += b'------------------------------------------------\n'


# Mensagem de agradecimento
command += b'Obrigado pela preferencia!\n'
command += b'Volte sempre!\n'
command += b'\n\n\n\n\n\n'  # Linhas em branco para garantir o corte

# Comando de corte de papel total
command += b'\x1D\x56\x00'  # Comando ESC/POS para corte total

# Função para enviar o comando diretamente para a impressora
def send_to_printer(printer_name, command):
    try:
        hPrinter = win32print.OpenPrinter(printer_name)
        try:
            hJob = win32print.StartDocPrinter(hPrinter, 1, ("Recibo", None, "RAW"))
            win32print.StartPagePrinter(hPrinter)
            win32print.WritePrinter(hPrinter, command)
            win32print.EndPagePrinter(hPrinter)
            win32print.EndDocPrinter(hPrinter)
        finally:
            win32print.ClosePrinter(hPrinter)
        print("Recibo impresso com sucesso.")
    except Exception as e:
        print(f"Erro ao enviar para a impressora: {e}")

# Enviar o recibo para a impressora
send_to_printer(printer_name, command)
