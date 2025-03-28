import ConnectionEntity from '../../ConnectionUseCase/ConnectionEntity';

export default class ConnectionFinder {
    public chooseConnectionIndex(connections: Array<ConnectionEntity>, positive: boolean): number | undefined {
        const filtered: Array<{ connection: ConnectionEntity, idx: number }> = connections
            .map((connection, idx) => ({connection, idx}))
            .filter(o => positive ? o.connection.value > 0 : o.connection.value < 0);

        if (filtered.length === 0) {
            return undefined;
        }

        const energySummation: number = filtered.reduce(
            (acc, obj) => acc + Math.abs(obj.connection.value),
            0
        );

        let random: number = Math.random() * energySummation;
        for (const o of filtered) {
            const amount: number = Math.abs(o.connection.value);
            if (random <= amount) {
                return o.idx;
            }
            random -= amount;
        }
        return filtered[0]?.idx;
    }
}
