import { ChangeEvent, MouseEvent, useState } from "react";

type AddNodeButtonProps = {
  onAdd: (element: string) => void;
  elements: string[];
};

function AddNodeButton({ onAdd, elements }: AddNodeButtonProps) {
  const [isSelectOpen, setIsSelectOpen] = useState(false);

  const onButtonClick = (e: MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsSelectOpen((p) => !p);
  };

  const handleSelect = (e: string) => {
    onAdd(e);
    setIsSelectOpen(false);
  };

  return (
    <div className="addButtonContainer">
      {isSelectOpen && (
        <ul className="buttonList">
          {elements.map((item) => (
            <li
              className="buttonListItem"
              key={item}
              onClick={() => handleSelect(item)}
            >
              {item}
            </li>
          ))}
        </ul>
      )}
      <button className="addButton" onClick={onButtonClick}>
        +
      </button>
    </div>
  );
}

export default AddNodeButton;
