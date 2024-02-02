import execa from 'execa'

export function run(command: string, ...args: string[]) {
  execa.sync(command, args, { reject: true, stdio: 'inherit', windowsHide: true })
}

export function shared<Result>(factory: () => Result): () => Result {
  let wrapper = () => {
    const instance = factory()
    wrapper = () => instance

    return instance
  }

  return () => wrapper()
}
