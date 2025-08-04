import { Badge } from "@/components/ui/badge";
import { Section as SectionType } from "@/types/blocks/section";

export default function Feature3({ section }: { section: SectionType }) {
  if (section.disabled) {
    return null;
  }

  return (
    <section className="py-20">
      <div className="container">
        <div className="max-w-4xl mx-auto text-center mb-20">
          {section.label && (
            <Badge variant="outline" className="mb-4">
              {section.label}
            </Badge>
          )}
          <h2 className="mb-6 text-pretty text-4xl font-bold lg:text-5xl">
            {section.title}
          </h2>
          <p className="max-w-3xl mx-auto text-lg text-muted-foreground lg:text-xl">
            {section.description}
          </p>
        </div>
        <div className="max-w-4xl mx-auto">
          <div className="relative">
            <div className="absolute left-8 top-0 bottom-0 w-px bg-border" />
            <div className="space-y-12">
              {section.items?.map((item, index) => (
                <div
                  key={index}
                  className="relative flex gap-6 items-start"
                >
                  <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-background border-4 border-background relative z-10">
                    <span className="flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                      {index + 1}
                    </span>
                  </div>
                  <div className="flex-1 pb-12">
                    <h3 className="mb-3 text-xl font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
