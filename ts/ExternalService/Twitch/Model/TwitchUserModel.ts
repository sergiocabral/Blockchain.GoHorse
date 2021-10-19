import { BaseModel } from "../../../Core/Model/BaseModel";

/**
 * Representa um usuário da twitch.
 */
export class TwitchUserModel extends BaseModel {
  /**
   * Identificador.
   */
  public get id(): number {
    return this.getValue(
      "id",
      this.json.id,
      Number.isNaN(this.json.id) ? Number(this.json.id) : undefined
    );
  }

  /**
   * Nome
   */
  public get name(): string {
    return this.getValue(
      "name",
      this.json.name,
      this.json.name !== undefined ? String(this.json.name) : undefined
    );
  }

  /**
   * Inscrições em canais.
   */
  public get subscribedChannels(): string[] {
    return this.getValue(
      "channel",
      this.json.channel,
      this.json.channel !== undefined ? [String(this.json.channel)] : undefined
    );
  }
}
