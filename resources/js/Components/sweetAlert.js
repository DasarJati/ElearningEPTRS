import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const baseOptions = {
  confirmButtonColor: '#4f46e5',
  cancelButtonColor: '#64748b',
  heightAuto: false,
};

export const showAlert = (t, { title, text, icon = 'info' }) => Swal.fire({
  ...baseOptions,
  title: title || t(icon === 'error' ? 'error_title' : 'notice'),
  text,
  icon,
  confirmButtonText: t('ok'),
});

export const showToast = ({ text, icon = 'success' }) => Swal.fire({
  toast: true,
  position: 'top-end',
  icon,
  titleText: text,
  showConfirmButton: false,
  timer: 2500,
  timerProgressBar: true,
});

export const confirmAlert = async (t, {
  title,
  text,
  icon = 'warning',
  confirmText,
}) => {
  const result = await Swal.fire({
    ...baseOptions,
    title,
    text,
    icon,
    showCancelButton: true,
    reverseButtons: true,
    confirmButtonText: confirmText || t('confirm_action'),
    cancelButtonText: t('cancel'),
  });

  return result.isConfirmed;
};
