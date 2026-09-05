import { XIcon } from "lucide-react"


const AddressForm = ({ resetForm, handleSubmit, form, setForm, editingId }: any) => {

    return (<>
        {/*overlay*/}
        <div className="fixed inset-0 bg-black/40 z-50" />




        {/*form container*/}
        <div onClick={resetForm} className="fixed inset-0 z-50 flex-center p-4">
            <form onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 w-full max-w-lg animate-fade-in" action="">

                {/*form header*/}
                <div>
                    <h2 className="text-lg font-semibold text-app-green">{editingId ? "Edit Address" : "Add New Address"}</h2>
                    <button type="button" onClick={resetForm} className="p-2 hover bg-app-cream rounded-lg">
                        <XIcon className="size-5" />

                    </button>
                </div>
                {/*form header fields*/}
                <div className="space-y-4">
                    <div>
                        <label > Label</label>
                        <input type="text" placeholder="Home,Work,etc.." required className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none" value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })} />
                    </div>
                    <div>
                        <label > Street Address</label>
                        <input type="text" required className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label > City</label>
                            <input type="text" required className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
                        </div>
                        <div>
                            <label > State</label>
                            <input type="text" required className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label > ZIP Code</label>
                            <input type="text" required className="w-full px-4 py-2.5 text-sm rounded-xl border border-app-border focus:border-app-green outline-none" value={form.zip} onChange={(e) => setForm({ ...form, zip: e.target.value })} />
                        </div>
                        <div className="flex items-end pb-1">
                            <label > ZIP Code</label>
                            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
                            <span>Set as Default</span>
                        </div>

                    </div>

                </div>
                <button type="submit">
                    {editingId ? "Update Address" : "Save Address"}

                </button>
            </form>
        </div>


    </>
    )
}

export default AddressForm