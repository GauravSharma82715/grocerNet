import {
  TruckIcon,
  LeafIcon,
  ClockIcon,
  ShieldCheckIcon,
} from "lucide-react";

const features = [
  {
    icon: TruckIcon,
    title: "Free Delivery",
    description: "Orders over ₹499",
  },
  {
    icon: LeafIcon,
    title: "100% Organic",
    description: "Certified products",
  },
  {
    icon: ClockIcon,
    title: "Same Day",
    description: "Express delivery",
  },
  {
    icon: ShieldCheckIcon,
    title: "Secure Pay",
    description: "Safe checkout",
  },
];

const Features = () => {
  return (
    <section className="w-full bg-white border border-gray-100 rounded-[28px] px-6 sm:px-10 py-6 sm:py-7 shadow-[0_4px_25px_rgba(0,0,0,0.03)] mb-12">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
        {features.map((feature, index) => {
          const Icon = feature.icon;

          return (
            <div
              key={index}
              className="flex items-center gap-4 p-2 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 group"
            >
              <div className="shrink-0 size-13 rounded-2xl bg-emerald-50/80 border border-emerald-100/80 flex items-center justify-center text-emerald-700 shadow-xs group-hover:bg-emerald-100/80 transition-colors">
                <Icon className="size-6 text-emerald-700" />
              </div>

              <div>
                <h3 className="font-bold text-sm sm:text-base text-gray-900 leading-tight group-hover:text-emerald-700 transition-colors">
                  {feature.title}
                </h3>

                <p className="text-xs text-gray-500 font-normal mt-0.5">
                  {feature.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default Features;