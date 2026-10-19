const isStrategyName = (value) => {
    switch (value) {
        case "sentence":
        case "apfel":
            return true;
        default:
            return false;
    }
};
export const parseOptions = (options) => {
    const strategy = options.strategy ?? "sentence";
    if (!isStrategyName(strategy)) {
        throw new Error(`unknown strategy: ${JSON.stringify(strategy)}`);
    }
    return { strategy };
};
