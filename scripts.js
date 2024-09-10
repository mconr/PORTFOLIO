$(document).ready(function() {
    $('.menu-link').click(function() {
        $('nav ul').toggleClass('active');
    });
});


// light effect following the cursor 


document.addEventListener("mousemove", (event) => {
const button = document.querySelector("button");
const rect = button.getBoundingClientRect();

const buttonCenterX = rect.left + rect.width / 2;
const buttonCenterY = rect.top + rect.height / 2;

const distanceX = event.clientX - buttonCenterX;
const distanceY = event.clientY - buttonCenterY;

const strengths = {
s1: 0.01,
s2: 0.03,
s3: 0.05,
s4: 0.09,
s5: 0.15,
s6: -0.3,
s7: 0
};

gsap.to(document.documentElement, {
"--x1": `${-distanceX * strengths.s1}px`,
"--y1": `${-distanceY * strengths.s1}px`,
"--x2": `${-distanceX * strengths.s2}px`,
"--y2": `${-distanceY * strengths.s2}px`,
"--x3": `${-distanceX * strengths.s3}px`,
"--y3": `${-distanceY * strengths.s3}px`,
"--x4": `${-distanceX * strengths.s4}px`,
"--y4": `${-distanceY * strengths.s4}px`,
"--x5": `${-distanceX * strengths.s5}px`,
"--y5": `${-distanceY * strengths.s5}px`,
"--x6": `${-distanceX * strengths.s6}px`,
"--y6": `${-distanceY * strengths.s6}px`,
"--x7": `${-distanceX * strengths.s7}px`,
"--y7": `${-distanceY * strengths.s7}px`,
duration: 0.3,
ease: "power2.out"
});
});


// --------------------------------------------------

