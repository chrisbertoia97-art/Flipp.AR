import type { ChangeEvent } from "react";

const labelCls = "block text-sm font-medium text-neutral-300 mb-1.5";
const inputCls =
  "w-full rounded-lg bg-neutral-900 border border-neutral-700 px-3.5 py-2.5 text-neutral-100 placeholder:text-neutral-600 focus:outline-none focus:border-amber-400 transition";
const helpCls = "mt-1.5 text-xs text-neutral-500";

export function TextField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  help?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{props.label}</label>
      <input
        className={inputCls}
        type={props.type ?? "text"}
        value={props.value}
        placeholder={props.placeholder}
        onChange={(e: ChangeEvent<HTMLInputElement>) => props.onChange(e.target.value)}
      />
      {props.help && <p className={helpCls}>{props.help}</p>}
    </div>
  );
}

export function NumberField(props: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
  min?: number;
  help?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{props.label}</label>
      <input
        className={inputCls}
        type="number"
        min={props.min ?? 0}
        value={props.value}
        onChange={(e) => {
          const v = e.target.value;
          if (v === "") return props.onChange("");
          const n = Number(v);
          props.onChange(n < (props.min ?? 0) ? (props.min ?? 0) : n);
        }}
      />
      {props.help && <p className={helpCls}>{props.help}</p>}
    </div>
  );
}

export function SelectField(props: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  placeholder?: string;
}) {
  return (
    <div>
      <label className={labelCls}>{props.label}</label>
      <select
        className={inputCls}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
      >
        <option value="">{props.placeholder ?? "Seleccionar..."}</option>
        {props.options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function SwitchField(props: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  onLabel?: string;
  offLabel?: string;
  help?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between rounded-lg border border-neutral-700 bg-neutral-900 px-4 py-3">
        <span className="text-sm font-medium text-neutral-200">{props.label}</span>
        <button
          type="button"
          onClick={() => props.onChange(!props.value)}
          className={`relative w-14 h-7 rounded-full transition ${
            props.value ? "bg-amber-400" : "bg-neutral-700"
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-neutral-950 transition-transform ${
              props.value ? "translate-x-7" : ""
            }`}
          />
        </button>
      </div>
      <div className="mt-1.5 flex justify-between text-xs text-neutral-500">
        <span>{props.value ? props.onLabel ?? "Activado" : props.offLabel ?? "Desactivado"}</span>
      </div>
      {props.help && <p className={helpCls}>{props.help}</p>}
    </div>
  );
}

export function CheckboxGroup(props: {
  label: string;
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
}) {
  function toggle(opt: string) {
    if (props.selected.includes(opt)) {
      props.onChange(props.selected.filter((s) => s !== opt));
    } else {
      props.onChange([...props.selected, opt]);
    }
  }
  return (
    <div>
      <label className={labelCls}>{props.label}</label>
      <div className="space-y-2">
        {props.options.map((opt) => (
          <label
            key={opt}
            className="flex items-center gap-3 rounded-lg border border-neutral-700 bg-neutral-900 px-3.5 py-2.5 cursor-pointer hover:border-neutral-500 transition"
          >
            <input
              type="checkbox"
              checked={props.selected.includes(opt)}
              onChange={() => toggle(opt)}
              className="w-4 h-4 accent-amber-400"
            />
            <span className="text-sm text-neutral-200">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
