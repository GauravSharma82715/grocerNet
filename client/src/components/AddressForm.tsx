import { XIcon } from "lucide-react";

interface AddressFormData {
    label: string;
    address: string;
    city: string;
    state: string;
    zip: string;
    isDefault: boolean;
}

interface AddressFormProps {
    resetForm: () => void;
    handleSubmit: (e: React.FormEvent) => void;
    form: AddressFormData;
    setForm: React.Dispatch<React.SetStateAction<AddressFormData>>;
    editingId: string | null;
}

const AddressForm = ({
    resetForm,
    handleSubmit,
    form,
    setForm,
    editingId,
}: AddressFormProps) => {
    return (
        <>
            {/* Backdrop overlay */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 transition-opacity"
                onClick={resetForm}
            />

            {/* Form modal dialog */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <form
                    onClick={(e) => e.stopPropagation()}
                    onSubmit={handleSubmit}
                    className="bg-white rounded-2xl p-6 sm:p-7 w-full max-w-lg shadow-2xl border border-app-border/40 animate-fade-in relative max-h-[90vh] overflow-y-auto"
                >
                    {/* Form header */}
                    <div className="flex items-center justify-between pb-4 mb-5 border-b border-app-border/40">
                        <div>
                            <h2 className="text-xl font-bold text-app-green">
                                {editingId ? "Edit Address" : "Add New Address"}
                            </h2>
                            <p className="text-xs text-app-text-light mt-0.5">
                                {editingId
                                    ? "Update your existing delivery address details"
                                    : "Add a new delivery address for fast checkout"}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={resetForm}
                            className="p-2 text-app-text-light hover:text-app-green hover:bg-app-cream rounded-xl transition-colors"
                            title="Close"
                        >
                            <XIcon className="size-5" />
                        </button>
                    </div>

                    {/* Form fields */}
                    <div className="space-y-4">
                        {/* Label */}
                        <div>
                            <label className="block text-xs font-semibold text-app-green mb-1.5">
                                Address Label
                            </label>
                            <input
                                type="text"
                                placeholder="e.g. Home, Work, Office"
                                required
                                className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border/70 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all placeholder:text-app-text-light/50"
                                value={form.label}
                                onChange={(e) => setForm({ ...form, label: e.target.value })}
                            />
                        </div>

                        {/* Street Address */}
                        <div>
                            <label className="block text-xs font-semibold text-app-green mb-1.5">
                                Street Address
                            </label>
                            <input
                                type="text"
                                placeholder="123 Main St, Apt / Suite / Floor"
                                required
                                className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border/70 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all placeholder:text-app-text-light/50"
                                value={form.address}
                                onChange={(e) => setForm({ ...form, address: e.target.value })}
                            />
                        </div>

                        {/* City & State */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-app-green mb-1.5">
                                    City
                                </label>
                                <input
                                    type="text"
                                    placeholder="City"
                                    required
                                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border/70 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all placeholder:text-app-text-light/50"
                                    value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-app-green mb-1.5">
                                    State
                                </label>
                                <input
                                    type="text"
                                    placeholder="State"
                                    required
                                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border/70 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all placeholder:text-app-text-light/50"
                                    value={form.state}
                                    onChange={(e) => setForm({ ...form, state: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* ZIP Code & Default Checkbox */}
                        <div className="grid grid-cols-2 gap-3 items-end">
                            <div>
                                <label className="block text-xs font-semibold text-app-green mb-1.5">
                                    ZIP Code
                                </label>
                                <input
                                    type="text"
                                    placeholder="ZIP / Postal Code"
                                    required
                                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border/70 focus:border-app-green focus:ring-1 focus:ring-app-green outline-none transition-all placeholder:text-app-text-light/50"
                                    value={form.zip}
                                    onChange={(e) => setForm({ ...form, zip: e.target.value })}
                                />
                            </div>

                            <label className="flex items-center gap-2.5 px-3.5 py-2.5 bg-app-cream/60 rounded-xl border border-app-border/40 cursor-pointer hover:bg-app-cream transition-colors h-[42px]">
                                <input
                                    type="checkbox"
                                    checked={form.isDefault}
                                    onChange={(e) =>
                                        setForm({ ...form, isDefault: e.target.checked })
                                    }
                                    className="size-4 rounded accent-app-green cursor-pointer"
                                />
                                <span className="text-xs font-semibold text-app-green select-none">
                                    Set as default
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3 mt-6 pt-4 border-t border-app-border/30">
                        <button
                            type="button"
                            onClick={resetForm}
                            className="flex-1 py-2.5 px-4 text-sm font-semibold text-app-text-light bg-app-cream hover:bg-app-cream/80 rounded-xl transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 py-2.5 px-4 text-sm font-semibold text-white bg-app-green hover:bg-app-green-light rounded-xl transition-colors shadow-sm"
                        >
                            {editingId ? "Update Address" : "Save Address"}
                        </button>
                    </div>
                </form>
            </div>
        </>
    );
};

export default AddressForm;