type ToastType = "success" | "error" | "warning" | "info"

let toastContainer: HTMLDivElement | null = null

const getToastContainer = () => {
  if (typeof document === "undefined") return null
  
  if (!toastContainer) {
    toastContainer = document.createElement("div")
    toastContainer.className = "fixed bottom-4 right-4 z-50 flex flex-col gap-2"
    document.body.appendChild(toastContainer)
  }
  return toastContainer
}

const removeToast = (toast: HTMLDivElement) => {
  toast.classList.add("opacity-0", "translate-x-full")
  setTimeout(() => {
    if (toast.parentNode) {
      toast.remove()
    }
  }, 300)
}

export function showToast(message: string, type: ToastType = "info", duration: number = 4000) {
  if (typeof document === "undefined") return
  
  const container = getToastContainer()
  if (!container) return

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
  }

  const icons = {
    success: "✅",
    error: "❌",
    warning: "⚠️",
    info: "ℹ️",
  }

  const toast = document.createElement("div")
  toast.className = `
    flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white
    ${colors[type]} transform transition-all duration-300
    translate-x-0 opacity-100 min-w-[200px] max-w-[350px]
  `
  toast.innerHTML = `
    <span class="text-lg">${icons[type]}</span>
    <span class="text-sm font-medium flex-1">${message}</span>
    <button class="ml-4 text-white/80 hover:text-white">✕</button>
  `

  const closeBtn = toast.querySelector("button")
  closeBtn?.addEventListener("click", () => removeToast(toast))

  container.appendChild(toast)

  setTimeout(() => {
    if (toast.parentNode) {
      removeToast(toast)
    }
  }, duration)
}
