import {useMemo} from "react";

export const useSortedRules = (rules, sort) => {
    return useMemo(() => {
        if (sort) {
            return [...rules].sort((a, b) => a[sort].localeCompare(b[sort]));
        }
        return rules;
    }, [sort, rules]);
}

export const useRules = (rules, sort, query) => {
    const sortedRules = useSortedRules(rules, sort);
    return useMemo(() => {
        let temp = sortedRules.filter(rule => rule.name.toLowerCase().includes(query.toLowerCase()));
        for (let item of sortedRules) {
            if (item.url?.includes(query.toLowerCase()) && !temp.includes(item)) {
                temp.push(item);
            }
        }
        return temp;
    }, [query, sortedRules]);
}