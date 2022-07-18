import {
  Button,
  Group,
  Input,
  LoadingOverlay,
  Select,
  TextInput,
} from "@mantine/core";
import { useForm, zodResolver } from "@mantine/form";
import { showNotification } from "@mantine/notifications";
import { trpc } from "utils/trpc";
import { z } from "zod";

const CUSTOM_ID_PREFIX = "exam-score-input-";
const ID_STUDENT_NUMBER = "student-number-";
const ID_SCORE = "score-";

interface Props {
  spreadsheetId: string;
  tabs: {
    name: string;
    sheetId: string;
  }[];
}

export function AddExamForm(props: Props) {
  const form = useForm({
    initialValues: {
      sheetId: "",
      examName: "",
      scoreArray: [{ studentNumber: "", score: "" }],
    },
    validate: zodResolver(
      z.object({
        sheetId: z.string().min(1, { message: "必須選擇分頁" }),
        examName: z.string(),
        scoreArray: z
          .object({
            studentNumber: z
              .string()
              .regex(/^\d\d$/, { message: "必須為兩個數字" }),
            score: z.string().regex(/^\d+$/, { message: "必須是數字" }),
          })
          .array(),
      })
    ),
  });
  const addExamMutation = trpc.useMutation("spreadsheet.addExam", {
    onSuccess: () => {
      form.reset();
      showNotification({
        title: "成功更新試算表",
        message: "",
        color: "green",
      });
    },
  });

  const scoreArrayLength = form.values.scoreArray.length;

  const handleScoreArray = () => {
    if (scoreArrayLength === 1) return false;
    form.values.scoreArray.forEach(({ score, studentNumber }, idx) => {
      if (score === "" && studentNumber === "") {
        form.removeListItem("scoreArray", idx);
      }
    });
  };

  const shouldDisplayNewScoreButton = () => {
    const lastScore = form.values.scoreArray[scoreArrayLength - 1];
    return lastScore.score !== "" && lastScore.studentNumber !== "";
  };

  const handleNextFocus = (
    nextElemType: `${typeof ID_STUDENT_NUMBER | typeof ID_SCORE}`,
    idx: number
  ) => {
    const nextId = `${CUSTOM_ID_PREFIX}${nextElemType}${idx}`;
    const nextElem = document.getElementById(nextId);
    if (nextElem !== null) {
      nextElem.focus();
    }
  };

  const tabSelectValues = props.tabs.map(({ name, sheetId }) => ({
    value: sheetId,
    label: name,
  }));

  const fields = form.values.scoreArray.map((_, idx) => (
    <Group key={idx} grow mb="xs">
      <TextInput
        id={`${CUSTOM_ID_PREFIX}${ID_STUDENT_NUMBER}${idx}`}
        placeholder="座號 (兩位數：01)"
        {...form.getInputProps(`scoreArray.${idx}.studentNumber`)}
        onChange={(e) => {
          form.getInputProps(`scoreArray.${idx}.studentNumber`).onChange(e);

          const value = e.target.value;
          if (value.length === 2 && idx == form.values.scoreArray.length - 1) {
            handleNextFocus("score-", idx);
            form.insertListItem("scoreArray", { studentNumber: "", score: "" });
          }
        }}
      />

      <TextInput
        id={`${CUSTOM_ID_PREFIX}${ID_SCORE}${idx}`}
        placeholder="成績"
        onKeyDown={(e) => {
          if (e.key !== "Enter") return;
          e.preventDefault();
          handleNextFocus("student-number-", idx + 1);
        }}
        {...form.getInputProps(`scoreArray.${idx}.score`)}
      />
    </Group>
  ));

  return (
    <form
      onSubmit={form.onSubmit((formValues) => {
        const parsedValue = formValues.scoreArray
          .filter(({ studentNumber }) => studentNumber.length === 2)
          .map(({ score, studentNumber }) => ({
            studentNumber: parseInt(studentNumber),
            score: parseInt(score),
          }));

        addExamMutation.mutate({
          examName: formValues.examName,
          scoreArray: parsedValue,
          sheetId: formValues.sheetId,
          spreadsheetId: props.spreadsheetId,
        });
      })}
    >
      <div style={{ position: "relative" }}>
        <LoadingOverlay visible={addExamMutation.isLoading} />

        <TextInput
          required
          label="考試名稱"
          {...form.getInputProps("examName")}
        />

        <Input.Wrapper label="成績">{fields}</Input.Wrapper>
        {shouldDisplayNewScoreButton() && (
          <Button
            onClick={() => {
              handleScoreArray();
              form.insertListItem("scoreArray", {
                studentNumber: "",
                score: "",
              });
            }}
          >
            新增一行
          </Button>
        )}

        <Select
          required
          label="選擇試算表分頁"
          data={tabSelectValues}
          error={form.errors.sheetId}
          {...form.getInputProps("sheetId")}
        />

        <Button
          type="submit"
          mt="sm"
          fullWidth
          onClick={() => handleScoreArray()}
        >
          送出成績
        </Button>
      </div>
    </form>
  );
}
