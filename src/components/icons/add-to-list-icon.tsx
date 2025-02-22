interface Props {
  class?: string
}

export const AddToListIcon = ({ class: className }: Props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="currentColor"
    className={`${className ?? ''} `}
    viewBox="0 0 32 32"
  >
    <path d="M0 0h24v24H0z" fill="none"></path>
    <path d="M4.929 4.929A10 10 0 1 1 19.07 19.07 10 10 0 0 1 4.93 4.93zM13 9a1 1 0 1 0-2 0v2H9a1 1 0 1 0 0 2h2v2a1 1 0 1 0 2 0v-2h2a1 1 0 1 0 0-2h-2V9z"></path>
  </svg>
)
