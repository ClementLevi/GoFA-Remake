/**
 * @template {RegExp} P
 * @typedef {string & {__regexPattern: P}} RegexpType
 * @deprecated
 * @package
 * @description 正则表达式类型，相信JsDoc还没有准备好接受这么复杂的类型
 */

/**
 * @author Linxae
 * @see https://juejin.cn/post/7195923686716899387
 */

/**
 * @template {number} N
 * @template {number[]} [Acc=[]]
 * @typedef {Acc["length"] extends N
 * ? Acc[number]
 * : Enumerate<N, [...Acc, Acc["length"]]>} Enumerate
 * @description 枚举类型
 * @exports
 */

/**
 * @template {number} Target
 * @template {any[]} [CurTuple=[]]
 * @typedef {CurTuple["length"] extends Target
 * ? CurTuple
 * :MakeTuple<Target, [...CurTuple, any]>} MakeTuple
 * @description 构建一个长度为Target的元组类型
 * @package
 */

/**
 * @template {number} T1
 * @template {number} T2
 * @typedef {[ ...MakeTuple<T1>, ...MakeTuple<T2>]["length"]} Add
 * @description 两数相加类型
 * @exports
 */

/**
 * @template {number} T
 * @template {number} F
 * @typedef {Exclude<Enumerate<Add<T,1> & number>, Enumerate<F>>} _IntRange
 * @description 整数范围，不好用，占用太高
 * @package
 */

/**
 * @template {any[]} T
 * @typedef {T extends [...infer Rest, any] ? [...Rest] : []} SliceLast
 * @description 删除元组类型最后一个元素,返回删除后的元组类型
 * @exports
 */

/**
 * @template {any[]} TA
 * @template {any[]} TB
 * @typedef {TA["length"] extends TB["length"]? true : false} IsEqualLen
 * @description 判断两个元组类型是否长度相等
 * @exports
 */

/**
 * @template {any[]} TA
 * @template {any[]} TB
 * @typedef {IsEqualLen<TA, TB> extends false
 *   ? TA["length"] extends 0
 *      ? 1
 *      : TB["length"] extends 0
 *      ? -1
 *      : CompareTuple<SliceLast<TA>, SliceLast<TB>>
 *   : 0} CompareTuple
 * @description 元组递归比较
 * @exports
 */

/**
 * @template {number} T1
 * @template {number} T2
 * @typedef {CompareTuple<MakeTuple<T1>, MakeTuple<T2>>} Compare
 * @description 比较两数大小
 * @exports
 */

/**
 * @template {any[]} TupleA
 * @template {any[]} TupleB
 * @typedef {Compare<TupleA["length"], TupleB["length"]> extends
 *   | 1
 *   | 0
 *   ? TupleB["length"] | Recurrence<TupleA, SliceLast<TupleB>>
 *   : never} Recurrence
 * @description 有限制地递归
 * @exports
 */

/**
 * @see https://www.cnblogs.com/gaoshang212/p/15604274.html
 */

/**
 * @template {number} N
 * @template {never[][]} [R=[[never]]]
 * @typedef {R[0][N] extends never ? R : BuildPowersOf2LengthArrays<N, [[...R[0], ...R[0]], ...R]>} BuildPowersOf2LengthArrays
 * @description 构建长度为 2 的幂的数组元组类型
 * @package
 */

/**
 * @template {number} N
 * @template {never[][]} R
 * @template {never[]} B
 * @typedef {B["length"] extends N ? B : [...R[0], ...B][N] extends never
 *   ? ConcatLargestUntilDone<N, R extends [R[0], ...infer U] ? U extends never[][] ? U : never : never, B>
 *   : ConcatLargestUntilDone<N, R extends [R[0], ...infer U] ? U extends never[][] ? U : never : never, [...R[0], ...B]>} ConcatLargestUntilDone
 * @description 递归连接直到完成
 * @package
 */

/**
 * @template {any[]} R
 * @template T
 * @typedef {{ [K in keyof R]: T }} Replace
 * @description 替换元组中的元素类型为 T
 * @package
 */

/**
 * @template T
 * @template {number} N
 * @typedef {number extends N ? T[] : {
 *   [K in N]:
 *   BuildPowersOf2LengthArrays<K, [[never]]> extends infer U ? U extends never[][]
 *   ? Replace<ConcatLargestUntilDone<K, U, []>, T> : never : never;
 * }[N]} TupleOf
 * @description 创建一个长度为 N 的元组类型，元素类型为 T
 * @exports
 */

/**
 * @template {number} N
 * @typedef {Partial<TupleOf<unknown, N>>["length"]} RangeOf
 * @description 获取从 0 到 N 的整数范围
 * @exports
 */

/**
 * @template {number} From
 * @template {number} To
 * @typedef {Exclude<RangeOf<To>, RangeOf<From>> | From} IntRange
 * @description 获取从 From 到 To 的整数范围。
 * @see https://www.cnblogs.com/gaoshang212/p/15604274.html
 * @borrows _IntRange
 * @exports
 */

/**
 * @typedef {'0'|'1'|'2'|'3'|'4'|'5'|'6'|'7'|'8'|'9'|'A'|'B'|'C'|'D'|'E'|'F'} HexCharacter
 * @exports
 */

/**
 * //@typedef {`#${HexCharacter}${HexCharacter}${HexCharacter}${HexCharacter}${HexCharacter}${HexCharacter}`} HexColorString
 * //@deprecated
 * //@package
 * //@description 十六进制颜色字符串，对于TS解释器来说也是太多种解释组合，JsDoc还没有准备好接受这么复杂的类型
 * //@see https://github.com/microsoft/TypeScript/issues/15480
 */

/** @see https://www.cnblogs.com/echoyya/p/17347552.html#2-%E8%8E%B7%E5%8F%96%E5%AD%97%E7%AC%A6%E4%B8%B2%E7%AC%AC%E4%B8%80%E4%B8%AA%E5%AD%97%E7%AC%A6-firstchar */

/**
 * @template {string} S
 * @typedef { S extends string ? `${Capitalize<S>}` : S} CapitalizeString
 * @description 首字母大写
 * @exports
 */

/**
 * @template {string} S
 * @typedef { S extends string ? `${Uncapitalize<S>}` : S} UncapitalizeString
 * @description 首字母小写
 * @exports
 */

/**
 * @template {string} S
 * @typedef {S extends `${infer L}${infer R}` ? L : never} FirstChar
 * @description 获取字符串的第一个字符
 * @exports
 */

/**
 * @template {string} S 源字符串
 * @template {string} C 指定开头字符
 * @typedef {S extends `${C}${infer R}` ? true : false} StartWith
 * @description 字符串是否以指定字符开头
 * @exports
 */

/**
 * @template {string} T
 * @template {string} [F=""]
 * @typedef {T extends `${infer L}${infer R}` ? LastChar<R, L> : F} LastChar
 * @description 获取字符串的最后一个字符
 * @exports
 */

/**
 * @template {string} S 源字符串
 * @template {string} C 指定结尾字符
 * @typedef {S extends `${infer L}${C}` ? true : false} EndWith
 * @description 字符串是否以指定字符结尾
 * @exports
 */

/**
 * @template {string} S
 * @template {any[]} [F=[]]
 * @typedef { S extends `${infer L}${infer R}` ? StringToTuple<R, [...F, L]> : F} StringToTuple
 * @description 字符串转元组
 * @exports
 */

/**
 * @template {any[]} T
 * @template {string} [F=""]
 * @typedef {T extends [infer L,...infer R]
 * ? Join<R, `${F}${L & string}`>
 * : F} Join
 * @description 元组转字符串
 * @exports
 */

/**
 * @template {string} S 源子字符串
 * @template {number} C 重复次数
 * @template {*[]} [A=[]] 拼接过程
 * @template {string} [B=""] 结果字符串
 * @typedef {C extends A["length"]
 *  ? B
 *  : RepeatStringBy<S, C, [...A, null], `${B}${S}`>} RepeatStringBy
 * @description 重复字符串
 * @exports
 */

/**
 * @template {string} S 源字符串
 * @template {string} C 分割符
 * @template {*[]} [R=[]] 分割结果
 * @typedef {S extends `${infer Head}${C}${infer Tail}`
 * ? SplitStringBy<Tail, C , [...R, Head]>
 * : [...R, S] } SplitStringBy // 最后一次不满足条件时，需要将最后一个单词也放入结果集中
 * @description 字符串分割
 * @exports
 */

/**
 * @template {string} S
 * @template {*[]} [F=[]]
 * @typedef { S extends `${infer L}${infer R}` ? StringLength<R, [...F, L]> : F["length"]} StringLength
 * @description 字符串长度
 * @exports
 */

/**
 * @template {string} S 源字符串
 * @template {string} C 待检索字符
 * @typedef { S extends ""
 * ? C extends ""
 *      ? true
 *      : false   // 空字符串时需要特殊处理
 * : S extends `${infer L}${C}${infer R}`
 *      ? true
 *      : false} IncludeChar
 * @description 检索字符串是否包含指定字符
 * @exports
 */

/**
 * @template {string} S 源字符串
 * @template {string} Target 待替换字符串
 * @template {string} Replacer 替换后字符串
 * @template {string} [F=""]
 * @typedef { Target extends ""
 *   ? S extends ""
 *       ? Replacer
 *       : `${Replacer}${S}`
 *   : S extends `${infer L}${Target}${infer R}` // 匹配模式
 *       ? ReplaceWith<R, Target, Replacer, `${F}${L}${Replacer}`> // 结果拼接并替换
 *       : `${F}${S}`} ReplaceWith
 * @description 字符串替换
 * @exports
 */

/**
 * @template {string} T
 * @typedef { T extends ` ${infer R}` ? TrimLeft<R> : T} TrimLeft
 * @description 字符串去除左侧空白
 * @exports
 */
/**
 * @template {string} T
 * @typedef { T extends `${infer L} ` ? TrimRight<L> : T} TrimRight
 * @description 字符串去除右侧空白
 * @exports
 */
/**
 * @template {string} T
 * @typedef { TrimLeft<TrimRight<T>>} Trim
 * @description 字符串去除两侧空白
 * @exports
 */

/**
 * @author Clement_Levi
 * @description 以下部分才是原创的类型体操
 */

/**
 * @typedef  { {length: number} } Lengthwise
 * @exports
 */

/**
 * @typedef {{ min: number, max: number}} RanIntLimitation
 * @exports
 */

/**
 * @template {string} S
 * @typedef {true extends StartWith<S, '#'>
 * ? (StringLength<ReplaceWith<S, '#', ''>> extends (6 | 8)
 *      ? true
 *      : false)
 * : false} HexColorString
 * @description 十六进制颜色字符串，形如 `#RRGGBB` 或 `#RRGGBBAA`
 * @todo 实际上只检查了后面是不是六位或八位，没管到底是什么字符
 * @exports
 */

module.exports = {};

if (require.main === module) {
    function main() {
        console.log("This is a library for type checking, not a script.");

        /**@type {Enumerate<3>} */
        let stepFromThree = 0;
        /**@type {Enumerate<3>} */
        let stepFromTwo = 1;
        /**@type {Enumerate<3>} */
        let stepFromOne = 2;
        /**@type {Enumerate<3>} */
        // @ts-expect-error
        let dropped = 4;

        /** @typedef {IntRange<0,255>} ColorValue*/
        /** @type {ColorValue}*/
        // @ts-expect-error
        let wrongColorValue = 256;
        /** @type {ColorValue}*/
        let okColorValue = 12;

        // @ts-expect-error
        /** @type {HexColorString} */
        let okHexColorString = "#FF0000";
        // @ts-expect-error
        /** @type {HexColorString} */
        // @ts-expect-error
        let badHexColorString = "#GF0000";

        /** @typedef {`#${HexCharacter}${HexCharacter}`} sHexColorString */
        /** @type {sHexColorString} */
        // @ts-expect-error
        let badHexColorString = "#GF";

        // @ts-expect-error
        /** @type {RegexpType<typeof /^yeah$/>} */
        // @ts-expect-error
        let badHexColorString = "#GF";
        // @ts-expect-error
        /** @type {RegexpType<typeof /^yeah$/>} */
        // @ts-expect-error
        let badHexColorString = "yeah";

        /**
         * @type {StartWith<"#FF0000", "#">}
         */
        let isColor = true;

        /**
         * @type {HexColorString<"#F0F0000">}
         */
        let isNotColor2 = false;
    }
    main();
}
