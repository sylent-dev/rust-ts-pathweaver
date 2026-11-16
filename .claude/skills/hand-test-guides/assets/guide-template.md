<!--
  The template of a guide of the tests by hand (hand-test-guides skill). Copy it to
  docs/tests/<feature>.md, list it in docs/tests/README.md, and remove this comment. It stays
  blank: the results come back in the conversation or the pull request.
-->
# <Feature>: the tests (<step>)

<Why, in two or three sentences: what changed, what the tests check.> Run the tests in a row. A ✅ is enough when it works; detail only what goes wrong.

## Before

1. In the folder of the project, on the branch of the step: `cd web && npm run dev`, then open the address it prints (or the address of the website deployed: <address>).
2. <The state to start from: a private window, an empty library, the files of `inputs/builds/` to use.>

## The tests

1. **<Name>**: <the action>.
   ✅ <The expected result: the exact text shown, the level reached.>

2. **<Name>**: <the action, up to the end of the list>.
   ✅ <The expected result.>

3. **Your own scenarios**: whatever else you want to try.

## Results

| Test | Result | Remark |
|---|---|---|
| 1. <Name> | | |
| 2. <Name> | | |
| 3. Your own scenarios | | |
