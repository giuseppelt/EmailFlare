import { VNode } from "preact";
import { useState } from "preact/hooks";


export type TabsProps = Readonly<{
  slots?: {
    sideHeader?: VNode
  },
  tabs: string[]
  children: (VNode | (() => VNode))[]
}>

export function Tabs({ tabs, children, slots }: TabsProps) {
  const [tabIndex, setTabIndex] = useState(0);

  return (
    <div class="tabs">
      <div class="tabs-header">
        {tabs.map((x, i) =>
          <button type="button" class={tabIndex === i ? "active" : undefined} onClick={() => setTabIndex(i)}>{x}</button>
        )}

        {slots?.sideHeader &&
          <div class="side-header">
            {slots.sideHeader}
          </div>
        }
      </div>

      <div class="tabs-body">
        {children.map((panel, idx) =>
          <div class={`tabs-panel${tabIndex === idx ? " active" : ""}`}>{
            typeof panel === "function"
              ? panel()
              : panel
          }</div>
        )}
      </div>
    </div>
  );
}
