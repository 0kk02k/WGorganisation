import { Toaster as Sonner, toast } from "sonner"

const Toaster = ({
  ...props
}) => {
  return (
    <Sonner
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-800 group-[.toaster]:border-4 group-[.toaster]:border-black group-[.toaster]:rounded-none group-[.toaster]:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-[.toaster]:font-bold",
          description: "group-[.toast]:text-gray-600 group-[.toast]:font-semibold",
          actionButton:
            "group-[.toast]:bg-black group-[.toast]:text-white group-[.toast]:rounded-none group-[.toast]:border-2 group-[.toast]:border-black",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-800 group-[.toast]:rounded-none group-[.toast]:border-2 group-[.toast]:border-black",
        },
      }}
      {...props} />
  );
}

export { Toaster, toast }
