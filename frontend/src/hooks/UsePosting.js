import {useState} from "react";

export const usePosting = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    const posting = async (callback) => {
        try {
            setIsLoading(true);
            await callback();
        } catch (e) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    };
    return [posting, isLoading, error];
};