import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  const { title, PAT } = await req.json();

  if (!title) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 });
  }

  if (!PAT) {
    return NextResponse.json({ error: 'Clarifai PAT is required' }, { status: 400 });
  }

  return NextResponse.json({
    success: true,
    data: {
      projectDir: "/generated/elon_musk_2024-11-25T09-45-06-429Z",
      script: "[Scene 1: A bustling office space with futuristic technology all around. Employees are focused on their computer screens, typing away. A poster of a rocket ship with the SpaceX logo is visible on the wall.]\n\nNarrator: \"In the world of technology and innovation, one name stands out among the rest: Elon Musk. The man behind some of the most revolutionary companies of the 21st century.\"\n\n[Scene 2: A montage of electric cars on a highway. The camera focuses on the sleek design of a Tesla Model S as it accelerates without a sound.]\n\nNarrator: \"Musk's vision for a sustainable future led him to disrupt the automotive industry with Tesla Motors. Electric cars that combine high performance with zero emissions are changing the way we think about transportation.\"\n\n[Scene 3: Inside a SpaceX facility, engineers are working on a spacecraft. The Falcon Heavy rocket is being prepared in the background, ready for its next mission.]\n\nNarrator: \"But Musk didn't stop there. With SpaceX, he's redefining space travel, aiming to make it more affordable and eventually colonize Mars. The successful launch of the Falcon Heavy rocket marked a new era in space exploration.\"\n\n[Scene 4: A busy city street with people walking and talking on their phones. Some people pass by a construction site with a sign that reads \"Future Site of The Boring Company's Underground Transit System.\"]\n\nNarrator: \"And if conquering the road and the stars wasn't enough, Musk's Boring Company seeks to solve urban traffic woes by creating a network of underground tunnels. His ideas and ventures continue to push the boundaries of what's possible.\"\n\n[Scene fades to black with the text \"Elon Musk: Visionary of the Modern Age.\"]\n\nNarrator: \"Elon Musk is not just a CEO or an entrepreneur. He's a visionary who has consistently turned science fiction into reality, inspiring generations to dream bigger and work harder to make those dreams come true.\"",
      scenes: [
        {
          scene: "Scene 1: A bustling office space with futuristic technology all around. Employees are focused on their computer screens, typing away. A poster of a rocket ship with the SpaceX logo is visible on the wall.",
          path: "/generated/elon_musk_2024-11-25T09-45-06-429Z/images/scene_1.jpg"
        },
        {
          scene: "Scene 2: A montage of electric cars on a highway. The camera focuses on the sleek design of a Tesla Model S as it accelerates without a sound.",
          path: "/generated/elon_musk_2024-11-25T09-45-06-429Z/images/scene_2.jpg"
        },
        {
          scene: "Scene 3: Inside a SpaceX facility, engineers are working on a spacecraft. The Falcon Heavy rocket is being prepared in the background, ready for its next mission.",
          path: "/generated/elon_musk_2024-11-25T09-45-06-429Z/images/scene_3.jpg"
        },
        {
          scene: "Scene 4: A busy city street with people walking and talking on their phones. Some people pass by a construction site with a sign that reads \"Future Site of The Boring Company's Underground Transit System.\"",
          path: "/generated/elon_musk_2024-11-25T09-45-06-429Z/images/scene_4.jpg"
        },
        {
          scene: "Scene fades to black with the text \"Elon Musk: Visionary of the Modern Age.\"",
          path: "/generated/elon_musk_2024-11-25T09-45-06-429Z/images/scene_5.jpg"
        }
      ],
      narrations: [
        {
          narration: "In the world of technology and innovation, one name stands out among the rest: Elon Musk. The man behind some of the most revolutionary companies of the 21st century.",
          path: "/generated/elon_musk_2024-11-25T09-45-06-429Z/audio/narration_1.mp3"
        },
        {
          narration: "Musk's vision for a sustainable future led him to disrupt the automotive industry with Tesla Motors. Electric cars that combine high performance with zero emissions are changing the way we think about transportation.",
          path: "/generated/elon_musk_2024-11-25T09-45-06-429Z/audio/narration_2.mp3"
        },
        {
          narration: "But Musk didn't stop there. With SpaceX, he's redefining space travel, aiming to make it more affordable and eventually colonize Mars. The successful launch of the Falcon Heavy rocket marked a new era in space exploration.",
          path: "/generated/elon_musk_2024-11-25T09-45-06-429Z/audio/narration_3.mp3"
        },
        {
          narration: "And if conquering the road and the stars wasn't enough, Musk's Boring Company seeks to solve urban traffic woes by creating a network of underground tunnels. His ideas and ventures continue to push the boundaries of what's possible.",
          path: "/generated/elon_musk_2024-11-25T09-45-06-429Z/audio/narration_4.mp3"
        },
        {
          narration: "Elon Musk is not just a CEO or an entrepreneur. He's a visionary who has consistently turned science fiction into reality, inspiring generations to dream bigger and work harder to make those dreams come true.",
          path: "/generated/elon_musk_2024-11-25T09-45-06-429Z/audio/narration_5.mp3"
        },
        {
          narration: "Combined Audio",
          path: "/generated/elon_musk_2024-11-25T09-45-06-429Z/audio/combined_audio.mp3"
        }
      ],
      video: "/generated/elon_musk_2024-11-25T09-45-06-429Z/video/final_video.mp4",
      metadata: {
        timestamp: "2024-11-25T09:48:05.512Z",
        user: "keshavsingh2004",
        totalDuration: 64.365714,
        durationPerScene: 12.8731428
      }
    }
  });
}
