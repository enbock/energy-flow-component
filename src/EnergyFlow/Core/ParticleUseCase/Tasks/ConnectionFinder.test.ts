import ConnectionFinder from './ConnectionFinder';
import ConnectionEntity from '../../ConnectionUseCase/ConnectionEntity';
import createSpy = jasmine.createSpy;

describe('ConnectionFinder', function (): void {
    let connectionFinder: ConnectionFinder,
        backupRandom: any;

    beforeEach(function (): void {
        connectionFinder = new ConnectionFinder();

        backupRandom = Math.random;
        Object.defineProperty(Math, 'random', {
            value: createSpy(),
            writable: true,
            enumerable: true,
            configurable: true
        });
    });

    afterEach(function (): void {
        Math.random = backupRandom;
    });

    it('should return undefined when no connections match the criteria', function (): void {
        const connections: Array<ConnectionEntity> = [
            {value: -5},
            {value: -10}
        ].map(data => {
            const entity = new ConnectionEntity();
            entity.value = data.value;
            return entity;
        });

        const result: number | undefined = connectionFinder.chooseConnectionIndex(connections, true);

        expect(result).toBeUndefined();
    });

    it('should return an index of a positive connection', function (): void {
        const connections: Array<ConnectionEntity> = [
            {value: 5},
            {value: -10},
            {value: 15}
        ].map(data => {
            const entity = new ConnectionEntity();
            entity.value = data.value;
            return entity;
        });
        (<any>Math.random).and.returnValue(0.1);

        const result: number | undefined = connectionFinder.chooseConnectionIndex(connections, true);

        expect(result).toBe(0);
    });

    it('should return an index of a negative connection', function (): void {
        const connections: Array<ConnectionEntity> = [
            {value: 5},
            {value: -10},
            {value: -15}
        ].map(data => {
            const entity = new ConnectionEntity();
            entity.value = data.value;
            return entity;
        });

        (<any>Math.random).and.returnValue(0.9);

        const result: number | undefined = connectionFinder.chooseConnectionIndex(connections, false);

        expect(result).toBe(2);
    });

    it('should handle edge case where all connections have zero value', function (): void {
        const connections: Array<ConnectionEntity> = [
            {value: 0},
            {value: 0}
        ].map(data => {
            const entity = new ConnectionEntity();
            entity.value = data.value;
            return entity;
        });

        const result: number | undefined = connectionFinder.chooseConnectionIndex(connections, true);

        expect(result).toBeUndefined();
    });
});
