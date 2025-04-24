# 3D Mosaic CAPTCHA Demo – A 3D Puzzle-Based Human Verification Interaction

This is an exploratory project aimed at designing and implementing a novel CAPTCHA system. It leverages WebGL-based visual interaction and combines 3D modeling with 2D image reconstruction to create a more secure and bot-resistant verification process.

## Live Demo

Try out the live demo in your browser: 
[https://mehver.github.io/3D-Mosaic-CAPTCHA/](https://mehver.github.io/3D-Mosaic-CAPTCHA/)

## Concept

The core idea is to challenge users with a shuffled 2D mosaic image, which they must reconstruct by dragging tiles into the correct positions. This image corresponds to a 3D model that can be interactively rotated, with changes reflected in real-time on the 2D view.

This new form of human-computer interaction increases both the complexity of user engagement and the difficulty for automated scripts to bypass it. The dynamic nature of the task also poses higher challenges for behavior simulation and spoofing.

## Current Implementation

The current version is a fully functional frontend-only demo that includes:

- Real-time 3D reference view rendered using WebGL
- Drag-to-reconstruct interaction for shuffled 2D mosaics
- Three difficulty levels representing varying degrees of image shuffling
- Noise Injection Mechanism to increase robustness against automation
- Iterative development snapshots, with each version documenting key design changes

This prototype is entirely frontend-based and requires no backend setup to run.

## Future Plans

While this is currently a prototype, future development may include:

- Backend integration: for securely shuffling 2D views and generating encrypted tokens
- Modular packaging: for usage in modern frontend frameworks and package managers like npm
- Behavioral analysis: incorporating user interaction patterns and timing-based analysis

## Notes

If you are interested in research or collaboration in areas like HCI or visual verification systems, feel free to start a topic in the Discussions section.

## License

This project is released under the BSD 3-Clause License.  
Code may be reused with proper attribution.

Copyright (c) 2025, Mehver (https://github.com/Mehver) — All rights reserved.
