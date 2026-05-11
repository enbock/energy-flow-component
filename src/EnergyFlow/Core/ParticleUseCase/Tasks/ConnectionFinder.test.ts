import {describe, it, beforeEach, afterEach} from 'node:test';
import * as assert from 'node:assert';
import {createSpy} from '../../../../../test/mock';
import ConnectionFinder from './ConnectionFinder';
import ConnectionEntity from '../../ConnectionUseCase/ConnectionEntity';

describe('EnergyFlow.Core.ParticleUseCase.Tasks.ConnectionFinder', function (): void {
    let connectionFinder: ConnectionFinder;
    let backupRandom: () => number;

    beforeEach(function (): void {
        connectionFinder = new ConnectionFinder();

        backupRandom = Math.random;
        Object.defineProperty(Math, 'random', {
            value: createSpy<() => number>(),
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
        ].map(function (data: {value: number}): ConnectionEntity {
            const entity: ConnectionEntity = new ConnectionEntity();
            entity.value = data.value;
            return entity;
        });

        const result: number | undefined = connectionFinder.chooseConnectionIndex(connections, true);

        assert.strictEqual(result, undefined);
    });

    it('should return an index of a positive connection', function (): void {
        const connections: Array<ConnectionEntity> = [
            {value: 5},
            {value: -10},
            {value: 15}
        ].map(function (data: {value: number}): ConnectionEntity {
            const entity: ConnectionEntity = new ConnectionEntity();
            entity.value = data.value;
            return entity;
        });
        (Math.random as unknown as MockFunction<() => number>).and.returnValue(0.1);

        const result: number | undefined = connectionFinder.chooseConnectionIndex(connections, true);

        assert.strictEqual(result, 0);
    });

    it('should return an index of a negative connection', function (): void {
        const connections: Array<ConnectionEntity> = [
            {value: 5},
            {value: -10},
            {value: -15}
        ].map(function (data: {value: number}): ConnectionEntity {
            const entity: ConnectionEntity = new ConnectionEntity();
            entity.value = data.value;
            return entity;
        });

        (Math.random as unknown as MockFunction<() => number>).and.returnValue(0.9);

        const result: number | undefined = connectionFinder.chooseConnectionIndex(connections, false);

        assert.strictEqual(result, 2);
    });

    it('should handle edge case where all connections have zero value', function (): void {
        const connections: Array<ConnectionEntity> = [
            {value: 0},
            {value: 0}
        ].map(function (data: {value: number}): ConnectionEntity {
            const entity: ConnectionEntity = new ConnectionEntity();
            entity.value = data.value;
            return entity;
        });

        const result: number | undefined = connectionFinder.chooseConnectionIndex(connections, true);

        assert.strictEqual(result, undefined);
    });
});
