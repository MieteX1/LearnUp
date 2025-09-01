import React from "react";

const PopupTaskEditor = ({
  editedTask,
  setEditedTask,
  handlePopupSave,
  handlePopupClose,
}) => {
  const taskTypes = [
    "Test jednokrotnego wyboru",
    "Test wielokrotnego wyboru",
    "Otwarte",
    "Uzupełnij lukę",
    "Dopasowanie",
    "Fiszki",
  ];

  const addMultipleCorrectAnswer = () => {
    setEditedTask({
      ...editedTask,
      multipleCorrectAnswers: [...(editedTask.multipleCorrectAnswers || []), ""],
    });
  };

  const addMultipleWrongAnswer = () => {
    setEditedTask({
      ...editedTask,
      multipleWrongAnswers: [...(editedTask.multipleWrongAnswers || []), ""],
    });
  };

  const addTwoPartAnswer = () => {
    setEditedTask({
      ...editedTask,
      leftPart: [...editedTask.leftPart, ""],
      rightPart: [...editedTask.rightPart, ""],
    });
  };

  const removeAnswer = (type, index) => {
    if (type === "correct") {
      setEditedTask({
        ...editedTask,
        multipleCorrectAnswers: editedTask.multipleCorrectAnswers.filter(
          (_, i) => i !== index
        ),
      });
    } else if (type === "wrong") {
      setEditedTask({
        ...editedTask,
        multipleWrongAnswers: editedTask.multipleWrongAnswers.filter(
          (_, i) => i !== index
        ),
      });
    } else if (type === "pair") {
      setEditedTask({
        ...editedTask,
        leftPart: editedTask.leftPart.filter((_, i) => i !== index),
        rightPart: editedTask.rightPart.filter((_, i) => i !== index),
      });
    }
  };
  
  const getPlaceholders = (type) => {
    switch (type) {
      case "Dopasowanie":
        return { left: "Pierwsza część", right: "Druga część", label: "Dopasuj części" };
      case "Fiszki":
        return { left: "Pierwsza strona", right: "Druga strona", label: "Fiszki" };
      case "Uzupełnij lukę":
        return { right: "Tekst w lukę", label: "Luki i odpowiedzi" };
      default:
        return { left: "Lewa część", right: "Prawa część", label: "Luki i odpowiedzi" };
    }
  };

  const placeholders = getPlaceholders(editedTask.type);

  // Automatyczne dodawanie luk
  const handleContentChange = (e) => {
    const newText = e.target.value;
    const underscoreCount = (newText.match(/_/g) || []).length;

    setEditedTask({
      ...editedTask,
      content: newText,
      rightPart: Array(underscoreCount).fill(""), // Dopasowuje liczbę inputów do liczby `_`
    });
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#F5F5F5] p-6 rounded-[40px] md:w-2/5 w-11/12 border-[5px] border-[#69DC9E] min-h-[75vh] flex flex-col max-h-[90vh]">
        <div className="overflow-y-auto p-6 flex-grow">
          <h2 className="text-xl font-semibold mb-6 text-center">Edytuj zadanie</h2>

          {/* Typ zadania */}
          <label className="block mb-2">
            Typ zadania
            <select
              value={editedTask.type}
              onChange={(e) => {
                const newType = e.target.value;

                setEditedTask((prevTask) => ({
                  ...prevTask,
                  type: newType,
                  ...(newType === "Uzupełnij lukę" ? { rightPart: [] } : {}), // Resetujemy luki
                  ...(newType === "Dopasowanie" || newType === "Fiszki"
                    ? { leftPart: [], rightPart: [] }
                    : {}), // Resetujemy pary dla dopasowania i fiszek
                }));
              }}
              className="block md:w-3/5 w-full border-2 p-1 border-[#D9D9D9] rounded-3xl bg-[#F5F5F5] px-3 shadow-lg mb-4"
            >
              <option value="" disabled>
                Wybierz typ
              </option>
              {taskTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>
          <label className="block mb-4">
            Poziom trudności
            <select
              value={editedTask.difficulty || "Łatwy"}
              onChange={(e) =>
                setEditedTask({ ...editedTask, difficulty: e.target.value })
              }
              className="block md:w-2/5 w-full border-2 p-1 border-[#D9D9D9] rounded-3xl bg-[#F5F5F5] px-3 shadow-lg"
            >
              <option value="easy">Łatwy</option>
              <option value="medium">Średni</option>
              <option value="hard">Trudny</option>
            </select>
          </label>

          {/* Nazwa zadania */}
          <label className="block mb-4">
            Nazwa zadania
            <input
              type="text"
              value={editedTask.name}
              onChange={(e) =>
                setEditedTask({ ...editedTask, name: e.target.value })
              }
              className="block md:w-3/5 w-full border-2 p-1 mt-1 border-[#D9D9D9] rounded-3xl bg-[#F5F5F5] px-3 shadow-lg"
            />
          </label>

          {/* Treść zadania */}
          {editedTask.type !== "Fiszki" && (
            <label className="block mb-4">
              Treść zadania
              {editedTask.type === "Uzupełnij lukę" && (
                <p className="text-sm text-gray-600 mb-1">
                  Użyj <strong>"_"</strong> do oznaczenia luki oraz <strong>"|"</strong> do nowej linii.
                </p>
              )}
              <textarea
                value={editedTask.content || ""}
                onChange={editedTask.type === "Uzupełnij lukę" ? handleContentChange : (e) =>
                  setEditedTask({ ...editedTask, content: e.target.value })
                }
                className="block md:w-4/5 w-full border-2 p-2 mt-1 border-[#D9D9D9] rounded-3xl bg-[#F5F5F5] px-3 shadow-lg h-40"
              />
            </label>
          )}

          {/* Test jednokrotnego wyboru */}
          {editedTask.type === "Test jednokrotnego wyboru" && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>
                  Poprawna odpowiedź
                  <input
                    type="text"
                    value={editedTask.singleCorrectAnswer}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        singleCorrectAnswer: e.target.value,
                      })
                    }
                    className="block w-full border p-2 mt-1 border-[#D9D9D9] rounded-3xl bg-[#F5F5F5] px-3 shadow-lg"
                  />
                </label>
              </div>
              <div>
                <label>
                  Błędne odpowiedzi
                  {editedTask.singleWrongAnswers.map((answer, index) => (
                    <input
                      key={index}
                      type="text"
                      value={answer}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          singleWrongAnswers: editedTask.singleWrongAnswers.map((a, i) =>
                            i === index ? e.target.value : a
                          ),
                        })
                      }
                      className="block w-full border p-2 mt-1 border-[#D9D9D9] rounded-3xl bg-[#F5F5F5] px-3 shadow-lg mb-2"
                    />
                  ))}
                </label>
              </div>
            </div>
          )}

          {/* Test wielokrotnego wyboru */}
          {editedTask.type === "Test wielokrotnego wyboru" && (
            <div className="grid grid-cols-2 gap-4">
              {/* Poprawne odpowiedzi */}
              <div>
                <label className="block font-bold">Poprawne odpowiedzi</label>
                {editedTask.multipleCorrectAnswers.map((answer, index) => (
                  <div key={index} className="relative flex items-center gap-2 my-2">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => {
                      setEditedTask({
                        ...editedTask,
                        multipleCorrectAnswers: editedTask.multipleCorrectAnswers.map((a, i) =>
                          i === index ? e.target.value : a
                        ),
                      });
                    }}
                    className="block w-full border p-2 border-[#D9D9D9] rounded-3xl bg-[#F5F5F5] px-3 shadow-lg"
                  />
                  <button
                    onClick={() => removeAnswer("correct", index)}
                    className="absolute right-[-13px] text-red-500 font-bold hover:scale-110"
                    title="Usuń odpowiedź"
                  >
                    X
                  </button>
                </div>
                ))}
                <button
                  onClick={addMultipleCorrectAnswer}
                  className="px-4 py-2 bg-[#69DC9E] rounded-lg hover:bg-[#5bc78d] mt-2"
                >
                  Dodaj poprawną odpowiedź
                </button>
              </div>

              {/* Błędne odpowiedzi */}
              <div>
                <label className="block font-bold">Błędne odpowiedzi</label>
                {editedTask.multipleWrongAnswers.map((answer, index) => (
                  <div key={index} className="relative flex items-center gap-2 my-2">
                  <input
                    type="text"
                    value={answer}
                    onChange={(e) => {
                      setEditedTask({
                        ...editedTask,
                        multipleWrongAnswers: editedTask.multipleWrongAnswers.map((a, i) =>
                          i === index ? e.target.value : a
                        ),
                      });
                    }}
                    className="block w-full border p-2 border-[#D9D9D9] rounded-3xl bg-[#F5F5F5] px-3 shadow-lg"
                  />
                  <button
                    onClick={() => removeAnswer("wrong", index)}
                    className="absolute right-[-13px] text-red-500 font-bold hover:scale-110"
                    title="Usuń odpowiedź"
                  >
                    X
                  </button>
                </div>                
                ))}
                <button
                  onClick={addMultipleWrongAnswer}
                  className="px-4 py-2 bg-[#FF6961] rounded-lg hover:bg-[#e55d55] mt-2"
                >
                  Dodaj błędną odpowiedź
                </button>
              </div>
            </div>
          )}

          {["Dopasowanie", "Fiszki", "Uzupełnij lukę"].includes(editedTask.type) && (
            <div>
              <label className="block">{placeholders.label}</label>

              {editedTask.rightPart.map((right, index) => (
                <div key={index} className="grid grid-cols-[10fr_10fr_1fr] gap-4 items-center my-2">
                  {editedTask.type !== "Uzupełnij lukę" && (
                    <input
                      type="text"
                      placeholder={placeholders.left}
                      value={editedTask.leftPart[index]}
                      onChange={(e) =>
                        setEditedTask({
                          ...editedTask,
                          leftPart: editedTask.leftPart.map((l, i) => (i === index ? e.target.value : l)),
                        })
                      }
                      className="block w-full border p-2 border-[#D9D9D9] rounded-3xl bg-[#F5F5F5] px-3 shadow-lg"
                    />
                  )}

                  <input
                    type="text"
                    placeholder={placeholders.right}
                    value={right}
                    onChange={(e) =>
                      setEditedTask({
                        ...editedTask,
                        rightPart: editedTask.rightPart.map((r, i) => (i === index ? e.target.value : r)),
                      })
                    }
                    className="block w-full border p-2 border-[#D9D9D9] rounded-3xl bg-[#F5F5F5] px-3 shadow-lg"
                  />

                  {editedTask.type !== "Uzupełnij lukę" && (
                    <button
                      onClick={() => removeAnswer("pair", index)}
                      className="text-red-500 font-bold hover:scale-110 w-full px-2"
                    >
                      X
                    </button>
                  )}
                </div>
              ))}

              {["Dopasowanie", "Fiszki"].includes(editedTask.type) && (
                <button
                  onClick={addTwoPartAnswer}
                  className="px-4 py-2 bg-[#69DC9E] rounded-lg hover:bg-[#5bc78d] mt-2"
                >
                  Dodaj nową parę
                </button>
              )}
            </div>
          )}
          </div>

        {/* Przyciski akcji */}
        <div className="flex justify-end gap-4 mt-4">
          <button onClick={handlePopupClose} className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400">
            Anuluj
          </button>
          <button onClick={handlePopupSave} className="px-4 py-2 bg-[#69DC9E] rounded-lg hover:bg-[#5bc78d]">
            Zapisz
          </button>
        </div>
      </div>
    </div>
  );
};

export default PopupTaskEditor;