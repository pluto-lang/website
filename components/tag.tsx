import React, { useState } from "react";

const stringToHue = (str) => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  // Use a larger prime number to enhance color difference
  hash = hash * 16777619;
  // Ensure the result is a valid hue value by taking the modulo operation
  return Math.abs(hash % 360); // Hue ranges from 0 to 359
};

const stringToColor = (str) => {
  const hue = stringToHue(str);
  // Control the saturation and lightness to generate a pleasant light color scheme
  const saturation = 70;
  const lightness = 83;
  return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
};

const Tag = ({ text, onClick }) => {
  const [isChecked, setChecked] = useState(false);
  const bgColor = stringToColor(text);

  const style = {
    backgroundColor: bgColor,
    color: "black",
  };

  const handleClick = () => {
    if (onClick) {
      onClick(text);
      setChecked(!isChecked);
    }
  };

  let className =
    "inline-flex items-center text-sm font-medium px-2 py-0.5 rounded-lg mr-1";
  if (onClick) {
    className += " cursor-pointer underline";
  }

  return (
    <span className={className} style={style} onClick={handleClick}>
      {isChecked ? "✔️ " : ""}
      {text}
    </span>
  );
};

const Tags = ({
  tags,
  onClick,
}: {
  tags: string[];
  onClick?: (tag) => void;
}) => {
  const renderTags = tags.map((tagText, index) => (
    <Tag key={index} text={tagText} onClick={onClick} />
  ));

  return (
    <div className="block">
      <div className="flex flex-wrap">{renderTags}</div>
    </div>
  );
};

export { Tag, Tags };
