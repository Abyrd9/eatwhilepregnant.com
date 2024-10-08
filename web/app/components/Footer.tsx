export const Footer = () => {
  return (
    <footer className="bg-white rounded-lg shadow m-4 dark:bg-gray-800 mt-auto w-full ml-0">
      <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between md:space-x-16">
        <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © {new Date().getFullYear()}{" "}
          <a href="https://flowbite.com/" className="hover:underline">
            eatwhilepregnant.com™
          </a>
          . All Rights Reserved.
        </span>
        <ul className="flex flex-wrap items-center mt-1.5 font-medium text-gray-500 dark:text-gray-400 sm:mt-0">
          {/* <li>
            <a href="/#" className="hover:underline me-4 md:me-6">
              About
            </a>
          </li> */}
          <li>
            <a
              href="mailto:abyrdwebservices@gmail.com"
              className="hover:underline text-xs"
            >
              Contact
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
};
