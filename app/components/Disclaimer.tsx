import { useState } from "react";
import { FiInfo } from "react-icons/fi";
import { Dialog } from "~/primitives/dialog";
import { cx } from "~/utils/helpers/cx";

export const Disclaimer = () => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div
        className={cx(
          "p-2 rounded-md  space-x-1 w-full border text-blue-500 bg-blue-50 border-blue-200 text-xs grid grid-cols-[16px_1fr] max-w-[400px]"
        )}
      >
        <FiInfo className="text-sm translate-y-px" />
        <div>
          The information on this website is not medical advice. Please read our
          full{" "}
          <button
            onClick={() => setOpen(true)}
            className="underline cursor-pointer inline"
          >
            disclaimer
          </button>{" "}
          before proceeding.
        </div>
      </div>

      <Dialog open={open} onOpenChange={() => setOpen(false)}>
        <Dialog.Portal>
          <Dialog.Overlay>
            <Dialog.Content>
              <Dialog.Title>Disclaimer</Dialog.Title>
              <p className="space-y-2 flex flex-col text-sm">
                <span>
                  The information provided on this website is for general
                  informational purposes only and is not intended to be a
                  substitute for professional medical advice, diagnosis, or
                  treatment.
                </span>
                <span>
                  The AI-generated content is based on available data and should
                  not be relied upon as complete, accurate, or up-to-date.
                </span>
                <span>
                  Always seek the guidance of your doctor or other qualified
                  healthcare provider with any questions you may have regarding
                  your health or a medical condition, including dietary
                  restrictions during pregnancy.
                </span>
                <span>
                  Never disregard professional medical advice or delay in
                  seeking it because of something you have read on this website.
                  If you think you may have a medical emergency, call your
                  doctor, go to the emergency department, or call 911
                  immediately.
                </span>
                <span>
                  eatwilepregnant.com does not recommend or endorse any specific
                  tests, physicians, products, procedures, opinions, or other
                  information that may be mentioned on this website.
                </span>
                <span>
                  {" "}
                  Reliance on any information provided by eatwilepregnant.com,
                  its employees, or other contributors is solely at your own
                  risk.
                </span>
              </p>
            </Dialog.Content>
          </Dialog.Overlay>
        </Dialog.Portal>
      </Dialog>
    </>
  );
};
