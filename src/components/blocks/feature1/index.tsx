import Icon from "@/components/icon";
import { Section as SectionType } from "@/types/blocks/section";

export default function Feature1({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  return (
    <section id={section.name} className="py-20">
      <div className="container">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-20">
            {section.title && (
              <h2 className="mb-6 text-pretty text-4xl font-bold lg:text-5xl">
                {section.title}
              </h2>
            )}
            {section.description && (
              <p className="max-w-3xl mx-auto text-lg text-muted-foreground lg:text-xl">
                {section.description}
              </p>
            )}
          </div>
          <div className="grid gap-12 md:grid-cols-3">
            {section.items?.map((item, i) => (
              <div 
                key={i} 
                className="group text-center"
              >
                {item.icon && (
                  <div className="flex size-12 mx-auto mb-4 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Icon
                      name={item.icon}
                      className="size-6"
                    />
                  </div>
                )}
                <h3 className="mb-3 text-lg font-semibold">
                  {item.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
