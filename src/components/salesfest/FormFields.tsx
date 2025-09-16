"use client";

import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { FormData } from "./gift";
import { ChevronDown } from "lucide-react";

const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ children, ...props }, ref) => (
  <div className="relative">
    <select
      ref={ref}
      {...props}
      className="w-full px-3 py-4 bg-green-50 rounded border border-green-200 focus:border-green-400 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition duration-300 appearance-none"
    >
      {children}
    </select>
    <ChevronDown
      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none"
      size={20}
    />
  </div>
));

Select.displayName = "Select";

interface FormFieldsProps {
  register: UseFormRegister<FormData>;
  errors: FieldErrors<FormData>;
}

const FormFields: React.FC<FormFieldsProps> = ({ register, errors }) => {
  const RequiredStar = () => <span className="text-red-500">*</span>;

  return (
    <div className="grid grid-cols-2 gap-4">
      {[
        { label: "Full Name", id: "full_name", required: true },
        {
          label: "Contact Number",
          id: "phone_number",
          type: "tel",
          required: true,
        },
      ].map(({ label, id, type = "text", required }) => (
        <div key={id} className="mb-4">
          <label
            htmlFor={id}
            className="block text-sm font-medium mb-1 text-white"
          >
            {label} {required && <RequiredStar />}
          </label>
          <input
            type={type}
            id={id}
            {...register(id as keyof FormData)}
            className="w-full px-3 py-3 bg-green-50 rounded border border-green-400 transition duration-300"
          />
          {errors[id as keyof FormData] && (
            <p className="mt-1 text-xs text-red-500">
              {errors[id as keyof FormData]?.message}
            </p>
          )}
        </div>
      ))}

      {/* <div className="mb-4">
        <label
          htmlFor="sold_area"
          className="block text-sm font-medium mb-1"
          style={{ color: "#6B3D2E" }}
        >
          City <RequiredStar />
        </label>
        <Controller
          name="sold_area"
          control={control}
          render={({ field }) => (
            <SearchableDropdown
              options={citiesOptions}
              value={field.value}
              onChange={field.onChange}
              placeholder="Select a city"
            />
          )}
        />
        {errors.sold_area && (
          <p className="mt-1 text-xs text-red-500">
            {errors.sold_area.message}
          </p>
        )}
      </div>

      <div className="mb-4">
        <label
          htmlFor="how_know_about_campaign"
          className="block text-sm font-medium mb-1"
          style={{ color: "#6B3D2E" }}
        >
          How did you know about the campaign? <RequiredStar />
        </label>
        <Controller
          name="how_know_about_campaign"
          control={control}
          render={({ field }) => (
            <Select {...field}>
              <option value="">Select an option</option>
              {campaignSources.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </Select>
          )}
        />
        {errors.how_know_about_campaign && (
          <p className="mt-1 text-xs text-red-500">
            {errors.how_know_about_campaign.message}
          </p>
        )}
      </div>

      {campaignSource === "Other" && (
        <div className="mb-4">
          <label
            htmlFor="other_campaign_source"
            className="block text-sm font-medium mb-1"
            style={{ color: "#6B3D2E" }}
          >
            Please specify <RequiredStar />
          </label>
          <input
            type="text"
            id="other_campaign_source"
            {...register("other_campaign_source")}
            className="w-full px-3 py-2 bg-green-50 rounded border border-green-200 focus:border-green-400 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition duration-300"
            placeholder="Enter how you knew about the campaign"
          />
        </div>
      )}

      <div className="mb-4">
        <label
          htmlFor="profession"
          className="block text-sm font-medium mb-1"
          style={{ color: "#6B3D2E" }}
        >
          Profession <RequiredStar />
        </label>
        <Controller
          name="profession"
          control={control}
          render={({ field }) => (
            <Select {...field}>
              <option value="">Select a profession</option>
              {professions.map((prof) => (
                <option key={prof} value={prof}>
                  {prof}
                </option>
              ))}
            </Select>
          )}
        />
        {errors.profession && (
          <p className="mt-1 text-xs text-red-500">
            {errors.profession.message}
          </p>
        )}
      </div>

      {profession === "Other" && (
        <div className="mb-4">
          <label
            htmlFor="other_profession"
            className="block text-sm font-medium mb-1"
            style={{ color: "#6B3D2E" }}
          >
            Please specify your profession <RequiredStar />
          </label>
          <input
            type="text"
            id="other_profession"
            {...register("other_profession")}
            className="w-full px-3 py-2 bg-green-50 rounded border border-green-200 focus:border-green-400 focus:ring focus:ring-green-200 focus:ring-opacity-50 transition duration-300"
            placeholder="Enter your profession"
          />
        </div>
      )} */}
    </div>
  );
};

export default FormFields;
