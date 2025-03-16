import math
from tkinter import Tk, Label, Entry, Button, Text, END, messagebox, StringVar, OptionMenu

# Método de Bisección
def biseccion(f, a, b, tol, max_iter):
    if f(a) * f(b) >= 0:
        return None, "El método de bisección no converge. Verifique el intervalo."
    iteracion = 0
    while (b - a) / 2 > tol and iteracion < max_iter:
        c = (a + b) / 2
        if f(c) == 0:
            break
        elif f(c) * f(a) < 0:
            b = c
        else:
            a = c
        iteracion += 1
    return (a + b) / 2, iteracion

# Método de Newton-Raphson
def newton_raphson(f, df, x0, tol, max_iter):
    iteracion = 0
    while iteracion < max_iter:
        x1 = x0 - f(x0) / df(x0)
        if abs(x1 - x0) < tol:
            return x1, iteracion
        x0 = x1
        iteracion += 1
    return x0, iteracion

# Función para resolver la ecuación
def resolver_ecuacion():
    try:
        # Obtener datos de la interfaz
        metodo = metodo_var.get()
        funcion = entrada_funcion.get()
        a = float(entrada_a.get())
        b = float(entrada_b.get())
        x0 = float(entrada_x0.get())
        tol = float(entrada_tol.get())
        max_iter = int(entrada_max_iter.get())

        # Definir la función y su derivada
        f = lambda x: eval(funcion)
        df = lambda x: eval(derivada_funcion.get())

        # Aplicar el método seleccionado
        if metodo == "Bisección":
            raiz, iteraciones = biseccion(f, a, b, tol, max_iter)
        elif metodo == "Newton-Raphson":
            raiz, iteraciones = newton_raphson(f, df, x0, tol, max_iter)
        else:
            messagebox.showerror("Error", "Método no válido.")
            return

        # Mostrar resultados
        if raiz is not None:
            resultado_text.delete(1.0, END)
            resultado_text.insert(END, f"Raíz encontrada: {raiz:.6f}\n")
            resultado_text.insert(END, f"Iteraciones: {iteraciones}")
        else:
            messagebox.showerror("Error", "No se pudo encontrar una raíz.")
    except Exception as e:
        messagebox.showerror("Error", f"Ocurrió un error: {str(e)}")

# Crear la interfaz gráfica
ventana = Tk()
ventana.title("Resolución de Ecuaciones Trascendentales")
ventana.geometry("400x400")

# Método
Label(ventana, text="Método:").grid(row=0, column=0)
metodo_var = StringVar(value="Bisección")
metodo_menu = OptionMenu(ventana, metodo_var, "Bisección", "Newton-Raphson")
metodo_menu.grid(row=0, column=1)

# Función
Label(ventana, text="Función (f(x)):").grid(row=1, column=0)
entrada_funcion = Entry(ventana)
entrada_funcion.grid(row=1, column=1)
entrada_funcion.insert(0, "math.exp(x) - 3*x")  # Ejemplo: e^x - 3x

# Derivada (solo para Newton-Raphson)
Label(ventana, text="Derivada (f'(x)):").grid(row=2, column=0)
derivada_funcion = Entry(ventana)
derivada_funcion.grid(row=2, column=1)
derivada_funcion.insert(0, "math.exp(x) - 3")  # Ejemplo: e^x - 3

# Intervalo [a, b] (para Bisección)
Label(ventana, text="Intervalo [a, b]:").grid(row=3, column=0)
entrada_a = Entry(ventana)
entrada_a.grid(row=3, column=1)
entrada_a.insert(0, "1")  # Ejemplo: a = 1
entrada_b = Entry(ventana)
entrada_b.grid(row=3, column=2)
entrada_b.insert(0, "2")  # Ejemplo: b = 2

# Valor inicial x0 (para Newton-Raphson)
Label(ventana, text="Valor inicial (x0):").grid(row=4, column=0)
entrada_x0 = Entry(ventana)
entrada_x0.grid(row=4, column=1)
entrada_x0.insert(0, "1.5")  # Ejemplo: x0 = 1.5

# Tolerancia
Label(ventana, text="Tolerancia:").grid(row=5, column=0)
entrada_tol = Entry(ventana)
entrada_tol.grid(row=5, column=1)
entrada_tol.insert(0, "1e-5")  # Ejemplo: tol = 1e-5

# Máximo de iteraciones
Label(ventana, text="Máximo de iteraciones:").grid(row=6, column=0)
entrada_max_iter = Entry(ventana)
entrada_max_iter.grid(row=6, column=1)
entrada_max_iter.insert(0, "100")  # Ejemplo: max_iter = 100

# Botón para resolver
Button(ventana, text="Resolver", command=resolver_ecuacion).grid(row=7, column=0, columnspan=2)

# Área de resultados
resultado_text = Text(ventana, height=10, width=50)
resultado_text.grid(row=8, column=0, columnspan=3)

# Ejecutar la interfaz
ventana.mainloop()