from cryptography.fernet import Fernet, InvalidToken


def encrypt_data(data: str, key: str) -> bytes:
    key_bytes = key.encode()
    fernet = Fernet(key_bytes)
    encrypted_data = fernet.encrypt(data.encode())
    return encrypted_data


def decrypt_data(encrypted_data: bytes, key: str) -> str:
    key_bytes = key.encode()
    fernet = Fernet(key_bytes)
    try:
        decrypted_data = fernet.decrypt(encrypted_data)
        return decrypted_data.decode()
    except InvalidToken:
        raise Exception("Invalid Key - Unsuccessful Decryption")
