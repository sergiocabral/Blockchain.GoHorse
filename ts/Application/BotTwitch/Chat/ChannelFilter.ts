/**
 * Definições de filtro para canais.
 */
export class ChannelFilter {
  /**
   * Todos os canais registrados.
   */
  public static ALL_JOINED_CHANNELS: string = Math.random().toString();

  /**
   * Canal de origem da mensagem.
   */
  public static ORIGIN_CHANNEL: string = Math.random().toString();

  /**
   * Verifica se um nome de canal é um filtro.
   */
  public static isFilter(channelName: string): boolean {
    return (
      channelName === ChannelFilter.ALL_JOINED_CHANNELS ||
      channelName === ChannelFilter.ORIGIN_CHANNEL
    );
  }
}
