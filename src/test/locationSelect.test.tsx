import { render, screen } from "@testing-library/react";
import { I18nextProvider } from "react-i18next";
import { describe, expect, it } from "vitest";
import { LocationSelect, type LocationValue } from "@/components/common/LocationSelect";
import { createI18n } from "@/i18n";

const i18n = createI18n();
void i18n.changeLanguage("en");

function renderSelect(value: LocationValue, allowAll = false) {
  return render(
    <I18nextProvider i18n={i18n}>
      <LocationSelect value={value} onChange={() => {}} allowAll={allowAll} />
    </I18nextProvider>,
  );
}

describe("LocationSelect", () => {
  it("shows the selected division, district and upazila", () => {
    renderSelect({ division: "Dhaka", district: "Gazipur", upazila: "Kaliganj" });
    expect(screen.getByLabelText("Division")).toHaveTextContent("Dhaka");
    expect(screen.getByLabelText("District")).toHaveTextContent("Gazipur");
    expect(screen.getByLabelText("Upazila / Thana")).toHaveTextContent("Kaliganj");
  });

  it("goes back to the placeholder when a lower level is cleared", () => {
    const { rerender } = renderSelect({ division: "Dhaka", district: "Gazipur", upazila: "Kaliganj" });
    rerender(
      <I18nextProvider i18n={i18n}>
        <LocationSelect value={{ division: "Khulna", district: "", upazila: "" }} onChange={() => {}} />
      </I18nextProvider>,
    );
    expect(screen.getByLabelText("District")).not.toHaveTextContent("Gazipur");
    expect(screen.getByLabelText("Upazila / Thana")).not.toHaveTextContent("Kaliganj");
    expect(screen.getByLabelText("Upazila / Thana")).toBeDisabled();
  });

  it("offers 'All' in filter mode", () => {
    renderSelect({ division: "", district: "", upazila: "" }, true);
    expect(screen.getByLabelText("Division")).toHaveTextContent("All");
  });
});
