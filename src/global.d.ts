declare module '*.css' {
    const content: any;
    export default content;
}

type Callback<Function = () => void> = Function;
