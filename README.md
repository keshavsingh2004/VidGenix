<p align="center"><h1 align="center">VIDGENIX</h1></p>
<p align="center">
	<img src="https://img.shields.io/github/license/keshavsingh2004/VidGenix?style=default&logo=opensourceinitiative&logoColor=white&color=0080ff" alt="license">
	<img src="https://img.shields.io/github/last-commit/keshavsingh2004/VidGenix?style=default&logo=git&logoColor=white&color=0080ff" alt="last-commit">
	<img src="https://img.shields.io/github/languages/top/keshavsingh2004/VidGenix?style=default&color=0080ff" alt="repo-top-language">
	<img src="https://img.shields.io/github/languages/count/keshavsingh2004/VidGenix?style=default&color=0080ff" alt="repo-language-count">
</p>
<p align="center"><!-- default option, no dependency badges. -->
</p>
<p align="center">
	<!-- default option, no dependency badges. -->
</p>
<br>

##  Table of Contents

- [ Overview](#-overview)
- [ Features](#-features)
- [ Project Structure](#-project-structure)
- [ Project Index](#-project-index)
- [Tech Stack](#-tech-stack)
- [ Getting Started](#-getting-started)
  - [ Prerequisites](#-prerequisites)
  - [ Installation](#-installation)
  - [ Usage](#-usage)
- [ Project Roadmap](#-project-roadmap)
- [ Contributing](#-contributing)
- [ License](#-license)
- [ Acknowledgments](#-acknowledgments)

##  Overview

An AI-powered application that generates video content from text prompts using Next.js, FFmpeg, and various AI services.

## Features

### 🚀 Text-to-Video Generation
- Enter a simple text prompt to automatically generate story scripts and scenes.
- VidGenix leverages advanced AI to craft coherent narratives from basic input, making video creation easy and intuitive.

### 🎨 AI-powered Image Generation
- Utilizes **DALL-E 3** to generate relevant and high-quality images for each scene.
- Each scene is accompanied by a visually appealing and contextually accurate image, automatically created based on the generated script.

### 🎙️ AI Voiceover/Narration
- Converts text into realistic, human-like speech with **ElevenLabs**' cutting-edge AI voice synthesis technology.
- Provides natural-sounding narration that matches the tone and content of the generated script.

### 🎥 Automated Video Assembly
- Combines images and voiceovers into a polished video slideshow.
- The platform automates the entire video assembly process, saving time and effort while ensuring a professional-quality result.

### 🔐 User Authentication
- Secure user authentication using **Clerk** to ensure safe and private access to the platform.
- Users can sign up and log in with ease, ensuring a secure and personalized experience.

### 📱 Responsive UI
- Built with modern web technologies like **Next.js**, **React**, and **Tailwind CSS**.
- Fully responsive design for an optimal experience across all devices, from desktops to mobile phones.

##  Project Structure

```sh
└── VidGenix/
    ├── README.md
    ├── components.json
    ├── middleware.ts
    ├── next.config.ts
    ├── package.json
    ├── pnpm-lock.yaml
    ├── postcss.config.mjs
    ├── public
    │   ├── file.svg
    │   ├── generated
    │   ├── globe.svg
    │   ├── next.svg
    │   ├── vercel.svg
    │   └── window.svg
    ├── src
    │   ├── app
    │   ├── components
    │   ├── hooks
    │   ├── lib
    │   ├── types
    │   └── utils
    ├── tailwind.config.ts
    └── tsconfig.json
```


###  Project Index
<details open>
	<summary><b><code>VIDGENIX/</code></b></summary>
	<details> <!-- __root__ Submodule -->
		<summary><b>__root__</b></summary>
		<blockquote>
			<table>
			<tr>
				<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/pnpm-lock.yaml'>pnpm-lock.yaml</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/next.config.ts'>next.config.ts</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/tsconfig.json'>tsconfig.json</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/middleware.ts'>middleware.ts</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/postcss.config.mjs'>postcss.config.mjs</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/package.json'>package.json</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/components.json'>components.json</a></b></td>
			</tr>
			<tr>
				<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/tailwind.config.ts'>tailwind.config.ts</a></b></td>
			</tr>
			</table>
		</blockquote>
	</details>
	<details> <!-- src Submodule -->
		<summary><b>src</b></summary>
		<blockquote>
			<details>
				<summary><b>types</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/types/clarifai.ts'>clarifai.ts</a></b></td>
					</tr>
					</table>
				</blockquote>
			</details>
			<details>
				<summary><b>lib</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/lib/utils.ts'>utils.ts</a></b></td>
					</tr>
					</table>
				</blockquote>
			</details>
			<details>
				<summary><b>components</b></summary>
				<blockquote>
					<details>
						<summary><b>ui</b></summary>
						<blockquote>
							<table>
							<tr>
								<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/components/ui/toaster.tsx'>toaster.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/components/ui/scroll-area.tsx'>scroll-area.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/components/ui/input.tsx'>input.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/components/ui/toast.tsx'>toast.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/components/ui/button.tsx'>button.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/components/ui/skeleton.tsx'>skeleton.tsx</a></b></td>
							</tr>
							<tr>
								<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/components/ui/card.tsx'>card.tsx</a></b></td>
							</tr>
							</table>
						</blockquote>
					</details>
				</blockquote>
			</details>
			<details>
				<summary><b>hooks</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/hooks/use-toast.ts'>use-toast.ts</a></b></td>
					</tr>
					</table>
				</blockquote>
			</details>
			<details>
				<summary><b>utils</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/utils/rate-limiter.ts'>rate-limiter.ts</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/utils/genration.ts'>genration.ts</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/utils/file.ts'>file.ts</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/utils/clarifai.ts'>clarifai.ts</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/utils/media.ts'>media.ts</a></b></td>
					</tr>
					</table>
				</blockquote>
			</details>
			<details>
				<summary><b>app</b></summary>
				<blockquote>
					<table>
					<tr>
						<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/app/layout.tsx'>layout.tsx</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/app/globals.css'>globals.css</a></b></td>
					</tr>
					<tr>
						<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/app/page.tsx'>page.tsx</a></b></td>
					</tr>
					</table>
					<details>
						<summary><b>api</b></summary>
						<blockquote>
							<details>
								<summary><b>demo</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/app/api/demo/route.ts'>route.ts</a></b></td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>generate</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/app/api/generate/route.ts'>route.ts</a></b></td>
									</tr>
									</table>
								</blockquote>
							</details>
							<details>
								<summary><b>clarifai</b></summary>
								<blockquote>
									<table>
									<tr>
										<td><b><a href='https://github.com/keshavsingh2004/VidGenix/blob/master/src/app/api/clarifai/route.ts'>route.ts</a></b></td>
									</tr>
									</table>
								</blockquote>
							</details>
						</blockquote>
					</details>
				</blockquote>
			</details>
		</blockquote>
	</details>
</details>

## Tech Stack

- **Frontend**: Next.js 15, React 19, shadcn
- **Authentication**: Clerk
- **AI Services**: 
  - OpenAI GPT-4o (Script Generation)
  - DALL-E 3 (Image Generation)
  - ElevenLabs (Text-to-Speech)
- **Video Processing**: FFmpeg
- **Styling**: TailwindCSS, Radix UI Components

##  Getting Started

###  Prerequisites

Before getting started with VidGenix, ensure your runtime environment meets the following requirements:

- **Programming Language:** TypeScript
- **Package Manager:** pnpm


###  Installation

Install VidGenix using one of the following methods:

**Build from source:**

1. Clone the VidGenix repository:
```sh
❯ git clone https://github.com/keshavsingh2004/VidGenix
```

2. Navigate to the project directory:
```sh
❯ cd VidGenix
```

3. Set up environment variables in `.env.local`:
```sh
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

4. Install the project dependencies:


**Using `pnpm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=fff" />](https://pnpm.io/)

```sh
❯ pnpm install
```


###  Usage
Run VidGenix using the following command:
**Using `pnpm`** &nbsp; [<img align="center" src="https://img.shields.io/badge/pnpm-F69220?logo=pnpm&logoColor=fff" />](https://pnpm.io/)

```sh
❯ pnpm run dev
```

## Roadmap

- [x] Basic video generation
- [ ] Enhanced AI scene generation
- [ ] Multi-language support
- [ ] Advanced video editing features


##  Contributing

- **💬 [Join the Discussions](https://github.com/keshavsingh2004/VidGenix/discussions)**: Share your insights, provide feedback, or ask questions.
- **🐛 [Report Issues](https://github.com/keshavsingh2004/VidGenix/issues)**: Submit bugs found or log feature requests for the `VidGenix` project.
- **💡 [Submit Pull Requests](https://github.com/keshavsingh2004/VidGenix/blob/main/CONTRIBUTING.md)**: Review open PRs, and submit your own PRs.

<details closed>
<summary>Contributing Guidelines</summary>

1. **Fork the Repository**: Start by forking the project repository to your github account.
2. **Clone Locally**: Clone the forked repository to your local machine using a git client.
   ```sh
   git clone https://github.com/keshavsingh2004/VidGenix
   ```
3. **Create a New Branch**: Always work on a new branch, giving it a descriptive name.
   ```sh
   git checkout -b new-feature-x
   ```
4. **Make Your Changes**: Develop and test your changes locally.
5. **Commit Your Changes**: Commit with a clear message describing your updates.
   ```sh
   git commit -m 'Implemented new feature x.'
   ```
6. **Push to github**: Push the changes to your forked repository.
   ```sh
   git push origin new-feature-x
   ```
7. **Submit a Pull Request**: Create a PR against the original project repository. Clearly describe the changes and their motivations.
8. **Review**: Once your PR is reviewed and approved, it will be merged into the main branch. Congratulations on your contribution!
</details>

<details closed>
<summary>Contributor Graph</summary>
<br>
<p align="left">
   <a href="https://github.com{/keshavsingh2004/VidGenix/}graphs/contributors">
      <img src="https://contrib.rocks/image?repo=keshavsingh2004/VidGenix">
   </a>
</p>
</details>

##  License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

