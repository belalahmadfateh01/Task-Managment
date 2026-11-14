"use client";

import { Check } from "lucide-react";

const tabs = ["همه", "خوانده شده", "خوانده نشده"];
const filterOptions = ["دارای ضمیمه", "بدون ضمیمه", "تازه‌ترین", "قدیمی‌ترین"];

type InboxToolbarProps = {
  activeTab: string;
  onActiveTabChange: (tab: string) => void;
  allItemsSelected: boolean;
  onToggleAllItems: () => void;
  isOpen: boolean;
  onToggleFilterMenu: () => void;
  selectedFilter: string;
  onSelectFilter: (filter: string) => void;
};

export default function InboxToolbar({
  activeTab,
  onActiveTabChange,
  allItemsSelected,
  onToggleAllItems,
  isOpen,
  onToggleFilterMenu,
  selectedFilter,
  onSelectFilter,
}: InboxToolbarProps) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-between gap-4 bg-surface py-2">
      <div className="flex flex-wrap items-center gap-3 rounded-3xl bg-white p-2">
        {tabs.map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => onActiveTabChange(tab)}
            className={`px-3 py-1 text-sm ${
              tab === activeTab
                ? "rounded-2xl bg-[#23B2EF] text-white shadow-[0_8px_20px_rgba(29,155,240,0.35)]"
                : "text-[#485261]"
            }`}>
            {tab}
          </button>
        ))}
      </div>

      <div className="flex flex-row-reverse items-center gap-1">
        <button
          type="button"
          onClick={onToggleAllItems}
          aria-label={
            allItemsSelected ? "لغو انتخاب همه موارد" : "انتخاب همه موارد"
          }
          aria-pressed={allItemsSelected}
          className="relative flex h-10 w-10 items-center justify-center">
          <img src="/imges/checkbox.svg" alt="" className="h-5 w-5" />
          {allItemsSelected && (
            <Check
              aria-hidden="true"
              size={13}
              strokeWidth={3}
              className="absolute text-black"
            />
          )}
        </button>

        <div className="relative">
          <button
            type="button"
            onClick={onToggleFilterMenu}
            aria-expanded={isOpen}
            className="flex items-center gap-3 px-4 py-2 text-[15px] font-medium text-[#111827]">
            <span className="font-bold">صندوق ورودی</span>
            <span className="flex h-7 w-7 items-center justify-center">
              <img
                src="/imges/dropdown.svg"
                alt=""
                className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </span>
          </button>

          {isOpen && (
            <div className="absolute left-0 top-[calc(100%+12px)] z-20 w-30 rounded-[18px] border border-[#E5E7EB] bg-white p-2 shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
              {filterOptions.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => onSelectFilter(option)}
                  className={`flex w-full items-center justify-start rounded-xl border border-transparent px-3 py-2 text-right text-sm transition-colors ${
                    selectedFilter === option
                      ? "border-[#D9E8FF] bg-[#EAF4FF] text-[#23B2EF]"
                      : "text-[#374151] hover:bg-[#F3F6FB]"
                  }`}>
                  {option}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
