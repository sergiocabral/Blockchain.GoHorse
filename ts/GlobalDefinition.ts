/**
 * Definições globais hard-coded.
 */
export class GlobalDefinition {
  /**
   * Tempo de 1 segundo em milesegundos.
   */
  public static readonly TIME_OF_ONE_SECOND_IN_MILLISECONDS = 1000;

  /**
   * Tempo de 1 minuto em milesegundos.
   */
  public static readonly TIME_OF_ONE_MINUTE_IN_MILLISECONDS =
    GlobalDefinition.TIME_OF_ONE_SECOND_IN_MILLISECONDS * 60;

  /**
   * Tempo de 1 hora em milesegundos.
   */
  public static readonly TIME_OF_ONE_HOUR_IN_MILLISECONDS =
    GlobalDefinition.TIME_OF_ONE_MINUTE_IN_MILLISECONDS * 60;

  /**
   * Tempo de 1 dia em milesegundos.
   */
  public static readonly TIME_OF_ONE_DAY_IN_MILLISECONDS =
    GlobalDefinition.TIME_OF_ONE_HOUR_IN_MILLISECONDS * 24;

  /**
   * Prefixo dos arquivos de ambiente.
   */
  public static readonly ENVIRONMENT_FILE_PREFIX = 'env';

  /**
   * Nome padrão do diretório node_modules do NodeJS.
   */
  public static readonly DIRECTORY_NAME_FOR_NODE_MODULES = 'node_modules';

  /**
   * Nome padrão do diretório dos pacotes @gohorse.
   */
  public static readonly DIRECTORY_NAME_FOR_GOHORSE = '@gohorse';

  /**
   * Domínio de internet relacionado aos pacotes gohorse.
   */
  public static readonly INTERNET_DOMAIN_FOR_GOHORSE = 'gohorse.dev';

  /**
   * Password padrão gravado em hard-coded para qualquer serviço.
   */
  public static readonly WELL_KNOWN_PASSWORD =
    'FEUfRQGkiwHoRhjwHjgpHCaMrcxkAENlCvpaX9wHDqJ3ljuQXipFtMnF8RwVrVGJAEp03JrICSwHHzHJ5kijAXRWsnKQrkAEi35iKBQwHhafBu4kmAU7k07vq2VAPjL1mZHD9A3NbapqaDEQVC13WlGf2VF9LOUgHZteOLciZQmg1ypgF3eHBYUqQFIxzGuxgqg0h7XxfkNdiYV94wb3AHH1Gpt5XYgIex2R3S4tA1QWoq49IHfJo0701tvX1qhGbGZbm2sNkSwhHcLJoJneAH4sKlc46kpjGWgQmMwLCQgEFgFaBzSLXHqArPkCsqI0YAl2k4XjF4FFnKqcOXfwytM7dleTiUseze7dEAvQo2cWDftgUJUhY3RMH4ulfMvoyEQxGbgdCYHUyYJHAT5SH4HTbTAIhYp9j0nAE2L9tObznAEdRF8WI3wWGqgJkbHwWCBYTRcwFSC696jHWQPqul9PAItcXlfN1RAwpK5G5L1Fdljs7rYswOjhJms2gAMMDi73pTzAFq5NcUhTQHY00koHMvgUQkuxYmNMwoshFJelAH3S1uJTlPQFNoauHFcgE8PsVj9vIQE6LkgIlagGl5e9PNmTAkbwI6IxDsAJD979cxnR4AsSqFyAJgatgMdPPAHRurYcD1twHiFregFaxgVzPEtkMFpAEfFAAtADUgKNPVyZAbKAEVbG8m7IBWcDkuRbAIaSA4qftLAiyYqKJDhbzatH2qAN89Lxoo1iAOHxuaqzPpASDiVqeGPAGUMTJKeHwgIQdX0CrkOAY8a8WHhjNLQpGDdKh5m67ylFAG5KdEx1PaQXbShUuQLpASM4X558yoAIqx8flvLWAE31g2kGbGQGciyQuU7XQHuRkSL5XwFelxsBsa5wKx1F0YF3AGcqiX6IunQFjqRz4HgSAFRzJ2tIcNAHbJ2Ghf4oAFYLvB6TWGwFeRfhFG6EQqgA3cnAwQAIEMYc5wu3gNrQz90QUHTBjC8DPYAG6w3npm0wGofcygLMzQIaiabvBN0A';
}
