import { async } from "regenerator-runtime";

const videoContainer = document.getElementById("videoContainer");
const form = document.getElementById("commentForm");


const addComment = (text, id) => {
  const videoComments = document.querySelector(".video__comments ul");
  const newComment = document.createElement("li");
  newComment.dataset.id = id;
  newComment.className = "video__comment";
  const icon = document.createElement("i");
  const span = document.createElement("span");
  const span2 = document.createElement("span");
  span.innerText = ` ${text}`;
  span2.innerText = "❌";
  icon.className = "fas fa-comment";
  newComment.appendChild(icon);
  newComment.appendChild(span);
  newComment.appendChild(span2);
  videoComments.prepend(newComment);
};

const handleSubmit = async (event) => {
  event.preventDefault();
  const textarea = form.querySelector("textarea");
  const text = textarea.value;
  const videoId = videoContainer.dataset.id;
  if(text ==""){
    return;
  }
  const response = await fetch(`/api/videos/${videoId}/comment`,{   //response.status
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({text}),
  });
  if(response.status == 201){
    textarea.value = "";
    const {newCommentId} = await response.json();
    addComment(text, newCommentId);
  }
};

if(form){
  form.addEventListener("submit", handleSubmit);
}