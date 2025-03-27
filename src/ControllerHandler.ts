export type PresentDataCallback = Callback<() => Promise<void>>;

export default interface ControllerHandler {
    initialize(presentData?: PresentDataCallback): Promise<void>;
}
