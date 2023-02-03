/**
 * Tipos de chave do GPG.
 * https://lists.gnupg.org/pipermail/gnupg-devel/2017-April/032762.html
 */
export enum GpgKeyType {
  Rsa = 1,
  DsaAndElgamal = 2,
  DsaSignOnly = 3,
  RsaSignOnly = 4
}
