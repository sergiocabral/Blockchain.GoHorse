import {Message} from "../../../Bus/Message";
import {ClockEvent} from "../../../Core/MessageEvent/ClockEvent";
import {ReportUpdated} from "../MessageEvent/ReportUpdated";
import {KeyValue} from "../../../Helper/Types/KeyValue";
import {UserOnChatModel} from "../Model/UserOnChatModel";
import fs from "fs";
import {Logger} from "../../../Log/Logger";
import {LogLevel} from "../../../Log/LogLevel";
import {LogContext} from "../../../Log/LogContext";
import Timeout = NodeJS.Timeout;
import {UserTagsList} from "./UserTagsList";

/**
 * Resposnável pro gravar e enviar o relatório
 */
export class UserWatcherReport {

    /**
     * Construtor.
     * @param outputFile Arquivo de saída.
     * @param userTagsList Tags de usuários.
     */
    public constructor(
        private outputFile: string,
        private userTagsList: UserTagsList) {

        Message.capture(ClockEvent, this, this.handlerClockEvent);
        Message.capture(ReportUpdated, this, this.handlerReportUpdated);
    }

    /**
     * Minutos de intervalo entre os envios do relatório para o log.
     * @private
     */
    private readonly sendToLogIntervalInMinutes = 5;

    /**
     * Relatório corrente.
     * @private
     */
    private report: KeyValue<UserOnChatModel[]> = { };

    /**
     * Salvamento do relatório pendente.
     * @private
     */
    private reportPendingSaveToLog: boolean = false;

    /**
     * Constroi o relatório em formato texto.
     * @private
     */
    private factoryReport(): string {
        const lines = [];

        for (const channel in this.report) {
            if (!this.report.hasOwnProperty(channel)) continue;

            const total = this.report[channel].length;
            const joined = this.report[channel].filter(user => user.joined).length;
            lines.push(`#${channel}: ${joined}/${total}`);

            ([] as UserOnChatModel[])
                .concat(this.report[channel])
                .sort(this.sortUserOnChatModel.bind(this))
                .forEach(user => {
                    const tags = this.userTagsList.getUserTags(user.userName);
                    lines.push(
                        `${user.messageCount.toString().padStart(6)} | ` +
                        `${user.creation.format()} | ` +
                        `${user.updated.format()} | ` +
                        `${user.joined ? 'X' : ' '} | ` +
                        `${user.userName.padEnd(30)} | ` +
                        tags.join(', '));
                });

            lines.push('');
        }

        return lines.join('\n');
    }

    /**
     * Ordenação de modelos UserOnChatModel
     * @param a
     * @param b
     * @private
     */
    private sortUserOnChatModel(a: UserOnChatModel, b: UserOnChatModel): number {
        const tagBotName = "bot";
        const aTags = this.userTagsList.getUserTags(a.userName);
        const bTags = this.userTagsList.getUserTags(b.userName)
        if (!aTags.includes(tagBotName) && bTags.includes(tagBotName)) return -1;
        else if (aTags.includes(tagBotName) && !bTags.includes(tagBotName)) return +1;
        else if (a.joined && !b.joined) return -1;
        else if (!a.joined && b.joined) return +1;
        else if (a.messageCount > b.messageCount) return -1;
        else if (a.messageCount < b.messageCount) return +1;
        else if (a.updated > b.updated) return -1;
        else if (a.updated < b.updated) return +1;
        else return a.userName.localeCompare(b.userName);
    }

    /**
     * Envia o relatório para o log.
     * @private
     */
    private saveToLog(): void {
        if (!this.reportPendingSaveToLog) return;
        this.reportPendingSaveToLog = false;

        const content = this.factoryReport();
        Logger.post('Chat Watcher Report:\n{chatWatcherReport}', {chatWatcherReport: content, event: "ChatWatcherReport" }, LogLevel.Information, LogContext.ChatWatcherApp);
    }

    /**
     * Timeout para gravação no arquivo.
     * @private
     */
    private saveToFileTimeout: Timeout = 0 as any;

    /**
     * Envia o relatório para o log.
     * @private
     */
    private saveToFile(): void {
        const action = () => {
            const fileContent = this.factoryReport();
            fs.writeFileSync(this.outputFile, Buffer.from(fileContent));
            Logger.post('Report saved: {outputFile}', {outputFile: this.outputFile}, LogLevel.Verbose, LogContext.ChatWatcherApp);
        };

        clearTimeout(this.saveToFileTimeout);
        const saveAfterMilliseconds = 1000;
        this.saveToFileTimeout = setTimeout(action, saveAfterMilliseconds);
    }

    /**
     * Processa resposta para mensagem.
     * @param message ReportUpdated
     * @private
     */
    private handlerReportUpdated(message: ReportUpdated) {
        this.report = message.report;
        this.reportPendingSaveToLog = true;
        this.saveToFile();
    }

    /**
     * Processa resposta para mensagem.
     * @param message ClockEvent
     * @private
     */
    private handlerClockEvent(message: ClockEvent) {
        if (message.hasElapsedMinutes(this.sendToLogIntervalInMinutes)){
            this.saveToLog();
        }
    }
}
