import {describe, it, beforeEach} from 'node:test';
import * as assert from 'node:assert';
import Memory from './Memory';

describe('EnergyFlow.Infrastructure.StateStorage.Memory', function (): void {
    let storage: Memory;

    beforeEach(function (): void {
        storage = new Memory();
    });

    it('should set and get connections', function (): void {
        assert.deepStrictEqual(storage.getConnections(), []);
        storage.setConnections(<MockedObject>'test::connections');
        assert.strictEqual(storage.getConnections(), <MockedObject>'test::connections');
    });

    it('should set and get particles', function (): void {
        assert.deepStrictEqual(storage.getParticles(), []);
        storage.setParticles(<MockedObject>'test::particles');
        assert.strictEqual(storage.getParticles(), <MockedObject>'test::particles');
    });
});
