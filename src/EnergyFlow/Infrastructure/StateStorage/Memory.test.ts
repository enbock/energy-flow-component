import Memory from './Memory';

describe('Memory', function (): void {
    let storage: Memory;

    beforeEach(function (): void {
        storage = new Memory();
    });

    it('should set and get connections', async function (): Promise<void> {
        expect(storage.getConnections()).toEqual([]);
        storage.setConnections(<MockedObject>'test::connections');
        expect(storage.getConnections()).toBe(<MockedObject>'test::connections');
    });

    it('should set and get particles', async function (): Promise<void> {
        expect(storage.getParticles()).toEqual([]);
        storage.setParticles(<MockedObject>'test::particles');
        expect(storage.getParticles()).toBe(<MockedObject>'test::particles');
    });
});
