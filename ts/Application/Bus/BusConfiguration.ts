import { Configuration } from "@sergiocabral/helper";

import { WebserverConfiguration } from "../../Webserver/WebserverConfiguration";

/**
 * Configurações do ButApplication.
 */
export class BusConfiguration extends Configuration {
  /**
   * Configurações do webserver.
   */
  public webserver = new WebserverConfiguration();
}
