import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, test } from 'vitest';
// Imported from the server-safe barrel (not the individual component files):
// this is the integration surface a real consumer uses, and it is also what
// T13 wired up in src/react/index.ts.
import {
  Checkbox,
  FileInput,
  Input,
  NativeSelect,
  RadioGroup,
  RadioGroupItem,
  Textarea,
} from '../src/react';

afterEach(cleanup);

/**
 * One <form> composing every field-level primitive from the "Campos de
 * formulário nativos" and "Escolhas múltiplas" P1 stories, plus a second,
 * differently-named RadioGroup used to prove group isolation. Each test
 * renders a fresh copy and drives it with userEvent, then reads the result
 * back out of a real `new FormData(form)` — never the React props — so the
 * assertions describe what the browser would actually submit.
 */
function renderFormFixture() {
  render(
    <form aria-label="profile form">
      <Input name="username" aria-label="Username" />
      <Textarea name="bio" aria-label="Bio" />
      <NativeSelect name="country" aria-label="Country" defaultValue="">
        <option value="">-- choose --</option>
        <option value="br">Brazil</option>
        <option value="us">USA</option>
      </NativeSelect>
      <Checkbox name="subscribe" aria-label="Subscribe" />
      <FileInput name="avatar" aria-label="Avatar" />
      <RadioGroup name="plan" legend="Plan">
        <RadioGroupItem value="basic">Basic</RadioGroupItem>
        <RadioGroupItem value="pro">Pro</RadioGroupItem>
        <RadioGroupItem value="enterprise">Enterprise</RadioGroupItem>
      </RadioGroup>
      <RadioGroup name="tier" legend="Tier">
        <RadioGroupItem value="free">Free</RadioGroupItem>
        <RadioGroupItem value="paid">Paid</RadioGroupItem>
      </RadioGroup>
    </form>
  );
  return screen.getByRole('form', { name: 'profile form' }) as HTMLFormElement;
}

describe('native form submission across the new primitives (FDP-01, FDP-02, FDP-06, FDP-08)', () => {
  // AC P1-Campos #3: NativeSelect is a real <select>, operable by
  // userEvent.selectOptions and serialized by FormData. This test exercises
  // Input, Textarea, NativeSelect, Checkbox and RadioGroup together and
  // checks the exact name/value pair each one contributes.
  test('produces the correct name/value pair for Input, Textarea, NativeSelect, Checkbox and RadioGroup', async () => {
    const form = renderFormFixture();
    const user = userEvent.setup();

    await user.type(screen.getByLabelText('Username'), 'ada');
    await user.type(screen.getByLabelText('Bio'), 'Loves formal proofs');
    await user.selectOptions(screen.getByLabelText('Country'), 'br');
    await user.click(screen.getByLabelText('Subscribe'));
    await user.click(screen.getByLabelText('Pro'));
    await user.click(screen.getByLabelText('Paid'));

    const data = new FormData(form);

    expect(data.get('username')).toBe('ada');
    expect(data.get('bio')).toBe('Loves formal proofs');
    expect(data.get('country')).toBe('br');
    // Native checkbox behaviour: checked with no explicit `value` attribute
    // serializes as the string "on" — this proves the component does not
    // override that default.
    expect(data.get('subscribe')).toBe('on');
    expect(data.get('plan')).toBe('pro');
    expect(data.get('tier')).toBe('paid');
  });

  // AC P1-Campos #8/#1: FileInput is a real <input type="file"> that
  // participates in the form. Its selected file is verified on the DOM node
  // directly, not through jsdom's FormData(form) copy: jsdom's FormData
  // constructor does produce a File entry for a file-typed input, but —
  // unlike a real browser — it does not preserve that File's `name`/`type`
  // on the copy it makes (verified in isolation against a plain,
  // component-free <input type="file">, so it is a jsdom limitation, not
  // something this test should paper over with a forced expectation).
  test('FileInput participates in FormData submission without interfering with the browser upload', async () => {
    const form = renderFormFixture();
    const user = userEvent.setup();
    const avatarFile = new File(['avatar-bytes'], 'avatar.png', { type: 'image/png' });
    const avatarInput = screen.getByLabelText('Avatar') as HTMLInputElement;

    await user.upload(avatarInput, avatarFile);

    expect(avatarInput.files).toHaveLength(1);
    expect(avatarInput.files?.[0]?.name).toBe('avatar.png');
    expect(avatarInput.files?.[0]?.type).toBe('image/png');

    const data = new FormData(form);
    expect(data.get('avatar')).toBeInstanceOf(File);
  });

  // AC P1-Escolhas #6: selecting a 3rd option in a group leaves exactly one
  // value for that group's `name` — proves mutual exclusivity, not just that
  // the last click happens to be the only one ever made.
  test('three radios in the same group are mutually exclusive', async () => {
    const form = renderFormFixture();
    const user = userEvent.setup();

    const basic = screen.getByLabelText('Basic');
    const pro = screen.getByLabelText('Pro');
    const enterprise = screen.getByLabelText('Enterprise');

    await user.click(basic);
    expect(basic).toBeChecked();

    await user.click(pro);
    expect(pro).toBeChecked();
    expect(basic).not.toBeChecked();

    await user.click(enterprise);
    expect(enterprise).toBeChecked();
    expect(basic).not.toBeChecked();
    expect(pro).not.toBeChecked();

    const data = new FormData(form);
    expect(data.getAll('plan')).toEqual(['enterprise']);
  });

  // Native behaviour the library must not distort: an unchecked checkbox
  // contributes no entry at all to FormData (not an empty string, not
  // `false` — the key is simply absent).
  test('an unchecked Checkbox is absent from FormData', () => {
    const form = renderFormFixture();

    const data = new FormData(form);

    expect(data.has('subscribe')).toBe(false);
  });

  // Two RadioGroups with different `name`s must not interfere: selecting in
  // one leaves the other's own selection untouched, and each group's value
  // lands under its own key.
  test('two RadioGroups with different names do not interfere with each other', async () => {
    const form = renderFormFixture();
    const user = userEvent.setup();

    await user.click(screen.getByLabelText('Basic'));
    await user.click(screen.getByLabelText('Free'));
    await user.click(screen.getByLabelText('Enterprise'));

    // Changing the "plan" group must not touch the "tier" group's selection.
    expect(screen.getByLabelText('Free')).toBeChecked();
    expect(screen.getByLabelText('Paid')).not.toBeChecked();
    expect(screen.getByLabelText('Enterprise')).toBeChecked();

    const data = new FormData(form);
    expect(data.getAll('plan')).toEqual(['enterprise']);
    expect(data.getAll('tier')).toEqual(['free']);
  });
});
