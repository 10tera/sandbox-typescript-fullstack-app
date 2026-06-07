# OS設定（prefers-reduced-motion）に縛られないアニメーション制御

アニメーションを減らしたいユーザーのために、Web では `prefers-reduced-motion` というメディアクエリが用意されています。ただ、この設定はOSレベルの切り替えであるため、「このアプリだけ変えたい」というニーズには応えられません。

この記事では、システム設定を尊重しつつ、アプリ内でユーザーが自分の好みに上書きできる仕組みを React + Jotai で実装する方法を紹介します。

# prefers-reduced-motionとは

`prefers-reduced-motion` は CSS のメディアクエリおよび JavaScript API で、ユーザーが OS の設定で「視差効果を減らす」「アニメーションを減らす」を有効にしているかどうかを検知できる仕組みです。
https://developer.mozilla.org/ja/docs/Web/CSS/Reference/At-rules/@media/prefers-reduced-motion

```css
@media (prefers-reduced-motion: reduce) {
  .animated {
    animation: none;
  }
}
```

```js
window.matchMedia("(prefers-reduced-motion: reduce)").matches; // true / false
```
前庭障害や光感受性てんかんなど、動きの多いUIで体調が悪化するユーザーがいます。この設定を尊重することはアクセシビリティの基本のひとつです。

# OS設定だけでは足りない理由
OS の設定を変えるのはハードルが高い場合があります　　多分。

- **共有端末**を使っていて OS 設定を変えられない
- アプリだけアニメーションを切りたいが、OS 全体には影響させたくない
- 逆に OS では減らす設定にしているが、このアプリだけは動きを楽しみたい

そこで「システム設定に従う / アニメーション OFF / アニメーション ON」の3択をアプリ内で切り替えられる仕組みを作りました。設定は `localStorage` に保存し、次回訪問時も維持されます。

# 実際の実装

```ts
"use client";
import { useAtom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useLayoutEffect, useSyncExternalStore } from "react";

// ユーザーが選んだ設定を localStorage に保存
const userMotionPrefAtom = atomWithStorage<"system" | "reduce" | "none">(
  "motion-preference",
  "system",
);

// ユーザー設定の読み書き（設定UIで使う）
export const useUserMotionPreference = () => {
  return useAtom(userMotionPrefAtom);
};

// OS のシステム設定を購読
const subscribe = (callback: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", callback);
  return () => mq.removeEventListener("change", callback);
};

const useSystemReducedMotion = () => {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false, // SSR 時のスナップショット
  );
};

// 最終的な「アニメーションを減らすか」を返す Hook
export const useReducedMotion = (): boolean => {
  const userPref = useAtomValue(userMotionPrefAtom);
  const systemReduced = useSystemReducedMotion();

  const reducedMotion =
    userPref === "system" ? systemReduced : userPref === "reduce";

  // <html data-motion="true/false"> を更新して CSS からも参照できるようにする
  useLayoutEffect(() => {
    document.documentElement.dataset.motion = String(reducedMotion);
  }, [reducedMotion]);

  return reducedMotion;
};
```

`window.matchMedia`の変化はReactの外側で起きるため、`useSyncExternalStore`を使って購読するようにしています。そしてjotaiのatomWithStorageを使ってlocalStorageと同期した上で、ユーザー設定を管理し最終的にアニメーションを抑制する/しないを真偽値で返すhookを実装しています。

またcssだけでアニメーション制御が完結する場合に対応するために、cssのdata属性（`data-motion`）にアニメーションの抑制の可否を反映することで、cssセレクタからも制御できるようにしています。

```css
/* CSS のみでアニメーションを止める書き方 */
.animated {
  animation: spin 1s linear infinite;
}

:root[data-motion="true"] .animated {
  animation: none;
}
```

:::message
サンプルでは`data-motion` 属性の更新をしている`useLayoutEffect`を`useReducedMotion()`内で行うようにしています。この場合だと、css だけで制御する場合も `useReducedMotion()` をアプリのどこか（レイアウトコンポーネントなど）で一度呼んでおく必要があります。呼ばれていない場合、`data-motion` 属性はセットされず、CSS のセレクタが機能しません。
なので、`useLayoutEffect`を切り出して別の場所に置くことを推奨します。
:::

# SSRによるちらつきの対処
サーバー側では`localStorage`もメディアクエリも参照できないため、`atomWithStorage`と`useSyncExternalStore`のSSR時の値とクライアント側で読み込まれた後の値が異なる場合があります。その瞬間にアニメーションON <-> OFF の切り替えが画面上で発生し、ちらつきとして見えてしまいます。

また、jotaiの`atomWithStorage`は`getOnInit`がデフォルト`false`のため、初期値でレンダリングしてから`localStorage`を読み込むため、これもちらつきの原因となってしまっています。

## ひとつの回避策
`atomWithStorage`の`getOnInit`を`true`にします。しかし、これだけではHydration Errorが起きる可能性があるため、jotai公式サイトに書かれている推奨手順に従って、`ClientOnly`で対象コンポーネントをラップします。

```ts
const userMotionPrefAtom = atomWithStorage<"system" | "reduce" | "none">(
  "motion-preference",
  "system",
  undefined,
  {
    getOnInit: true,
  },
);
```
https://jotai.org/docs/utilities/storage#server-side-rendering
```tsx
"use client";
import { type ReactNode, useLayoutEffect, useState } from "react";

export const ClientOnly = ({ children }: { children: ReactNode }) => {
  const [hasMounted, setHasMounted] = useState(false);

  useLayoutEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return null;
  }

  return <>{children}</>;
};

```

# まとめ
- `prefers-reduced-motion`はアクセシビリティのために尊重すべきだが、OS設定の変更はユーザーによってハードルが高い可能性がある
- アプリ内に「システム設定/OFF/ON」の三択を用意することで、ユーザーに柔軟な体験を提供することができる
- useSyncExternalStore`を使いシステム設定の変化をリアクティブに購読し、`atomWithStorage`でユーザー設定を管理することで、両者を簡単に合成できる
- cssのdata属性を使うことで、jsを使わずともアニメーションの抑制制御を行うことができる

以上
