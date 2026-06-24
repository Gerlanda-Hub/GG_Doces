# 📱 Guia Completo: Gerar o APK — Mundo de Doces da GG

O projeto já está **totalmente pré-configurado** com Capacitor. Os ficheiros `capacitor.config.ts`, plugins nativos (Splash Screen, Status Bar, Botão Voltar) e o ícone já estão prontos. Só precisas de executar alguns comandos no **teu computador** para gerar o ficheiro `.apk` final.

> ⚠️ **Importante:** A compilação final do APK tem de ser feita no teu computador, pois requer o **Android Studio** e o **Java JDK** instalados (não é possível compilar APK nativo dentro deste ambiente web).

---

## ✅ O que já está pronto neste projeto
- ✅ Capacitor instalado (`@capacitor/core`, `@capacitor/cli`, `@capacitor/android`)
- ✅ Plugins: Splash Screen, Status Bar e App (botão voltar do Android)
- ✅ `capacitor.config.ts` configurado (App ID: `com.ggdoces.app`, Nome: `Mundo de Doces da GG`)
- ✅ Cores da marca na splash screen (rosa #e8456b) e barra de estado
- ✅ Roteamento via HashRouter (100% compatível com apps nativos)
- ✅ Ícone do app gerado em `public/app-icon.png`

---

## 🛠️ Requisitos no teu Computador
1. **Node.js** 18+ 
2. **Android Studio** (com Android SDK)
3. **Java JDK 17**

---

## 🚀 Passos para Gerar o APK

### 1. Descarrega o projeto e instala as dependências
```bash
npm install
```

### 2. Compila o site
```bash
npm run build
```

### 3. Adiciona a plataforma Android (só na primeira vez)
```bash
npx cap add android
```

### 4. Sincroniza o site com o projeto Android
```bash
npx cap sync
```
> 💡 Repete os passos `npm run build` + `npx cap sync` sempre que alterares o site.

### 5. Abre no Android Studio
```bash
npx cap open android
```

### 6. Compila o APK dentro do Android Studio
1. Espera o **Gradle** sincronizar (primeira vez demora alguns minutos).
2. No menu: **Build → Build Bundle(s) / APK(s) → Build APK(s)**.
3. Quando terminar, clica em **"locate"** na notificação para encontrar o ficheiro:
   `android/app/build/outputs/apk/debug/app-debug.apk`

---

## 🎨 Personalizar o Ícone do App
1. No Android Studio, clica com o botão direito na pasta `app/res`.
2. **New → Image Asset**.
3. Escolhe o ficheiro `public/app-icon.png` como imagem de origem.
4. Gera os ícones adaptativos e clica em **Finish**.

---

## 🌐 Disponibilizar o APK para Download no Site
1. Renomeia o ficheiro gerado para **`app-release.apk`**.
2. Coloca-o na pasta **`public/`** do projeto.
3. Faz novo deploy do site.
4. **Pronto!** O botão "Descarregar Aplicativo Android (.APK)" na página inicial passa a funcionar automaticamente.

---

## 📦 Gerar APK Assinado para a Google Play Store (opcional)
1. No Android Studio: **Build → Generate Signed Bundle / APK**.
2. Cria uma **keystore** nova (guarda bem a palavra-passe!).
3. Escolhe **release** como build variant.
4. O ficheiro `.aab` ou `.apk` assinado fica pronto para enviar à Play Console.

---

🎂 **O teu site "Mundo de Doces da GG" está pronto para se tornar uma App Android nativa!**
