import {Git} from "../../Process/Git";
import {CoinModel} from "./Model/CoinModel";
import path from "path";
import fs from "fs";

/**
 * Operações da blockchain.
 */
export class Blockchain {
    /**
     * Construtor.
     * @param coin Moeda.
     */
    public constructor(private coin: CoinModel) {
        const initialDirectory = fs.realpathSync(
            fs.existsSync(coin.directory)
                ? coin.directory
                : path.resolve(coin.directory, '..'));

        this.git = new Git(initialDirectory);

        //TODO: Tirar daqui o initialize.
        this.initialize();
    }

    /**
     * Manipulação do Git.
     * @private
     */
    private git: Git;

    /**
     * Inicializa a blockchain.
     */
    public initialize(): void {
        this.git.clone(this.coin.repository, this.coin.directory);
    }
}
