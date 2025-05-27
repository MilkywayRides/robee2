interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    className?: string;
  }
  
  export function PageHeader({ className, children, ...props }: PageHeaderProps) {
    return (
      <div className="flex flex-col gap-4 md:gap-6" {...props}>
        {children}
      </div>
    );
  }
  
  export function PageHeaderHeading({
    className,
    ...props
  }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
      <h1
        className="text-3xl font-bold tracking-tight text-foreground md:text-4xl"
        {...props}
      />
    );
  }
  
  export function PageHeaderDescription({
    className,
    ...props
  }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className="text-muted-foreground" {...props} />;
  }